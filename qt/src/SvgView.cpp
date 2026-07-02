/**
 *  @file  SvgView.cpp
 *  @brief Implementacion del visor SVG con animaciones por pieza.
 */

#include "SvgView.h"
#include "AnimPresets.h"

#include <QDomElement>
#include <QFile>
#include <QDragEnterEvent>
#include <QMimeData>
#include <QGraphicsSceneMouseEvent>
#include <QKeyEvent>
#include <QTextStream>
#include <QtMath>
#include <QUrl>

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const double SvgView::SVG_W = 200;
const double SvgView::SVG_H = 200;

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

SvgView::SvgView(QWidget *parent)
    : QGraphicsView(parent)
    , m_scene(new QGraphicsScene(this))
{
    setScene(m_scene);
    setRenderHints(QPainter::Antialiasing | QPainter::SmoothPixmapTransform);
    setViewportUpdateMode(QGraphicsView::FullViewportUpdate);
    setDragMode(QGraphicsView::ScrollHandDrag);
    setAcceptDrops(true);
    setBackgroundBrush(QColor("#1a1d27"));
    setFrameShape(QFrame::NoFrame);

    // Escena mas grande que el SVG para permitir arrastrar piezas
    m_scene->setSceneRect(-SVG_W / 2, -SVG_H / 2,
                          SVG_W * 2,  SVG_H * 2);

    // ---- Asa de rotacion (oculta inicialmente) ----
    QPen rotPen(QColor("#6c5ce7"), 2);
    m_rotLine = m_scene->addLine(0, 0, 0, 0, rotPen);
    m_rotLine->setZValue(9998);
    m_rotLine->hide();

    m_rotCenter = m_scene->addEllipse(0, 0, 8, 8,
        QPen(QColor("#6c5ce7"), 2), QBrush(QColor("#6c5ce7")));
    m_rotCenter->setZValue(9999);
    m_rotCenter->hide();

    m_rotHandle = m_scene->addEllipse(0, 0, 16, 16,
        QPen(QColor("#6c5ce7"), 2),
        QBrush(QColor(108, 92, 231, 60)));
    m_rotHandle->setCursor(Qt::CrossCursor);
    m_rotHandle->setZValue(10000);
    m_rotHandle->hide();
}

void SvgView::fitSvg()
{
    fitInView(m_scene->sceneRect(), Qt::KeepAspectRatio);
}

// ---------------------------------------------------------------------------
// Asa de rotacion
// ---------------------------------------------------------------------------

void SvgView::updateRotationHandle()
{
    if (!m_selectedElement || !m_selectedElement->item) {
        hideRotationHandle();
        return;
    }
    auto *item = m_selectedElement->item;
    QRectF bounds = item->boundingRect();
    QPointF center = item->scenePos() + bounds.center();
    double handleDist = qMax(bounds.width(), bounds.height()) * 0.6 + 20;
    double angleRad = qDegreesToRadians(item->rotation());
    QPointF handlePos(
        center.x() + handleDist * qSin(angleRad),
        center.y() - handleDist * qCos(angleRad));

    // Linea centro -> asa
    m_rotLine->setLine(center.x(), center.y(),
                       handlePos.x(), handlePos.y());
    m_rotLine->show();

    // Circulo centro
    m_rotCenter->setRect(center.x() - 4, center.y() - 4, 8, 8);
    m_rotCenter->show();

    // Asa (circulo arrastrable)
    m_rotHandle->setRect(handlePos.x() - 8, handlePos.y() - 8, 16, 16);
    m_rotHandle->show();
}

void SvgView::hideRotationHandle()
{
    m_rotLine->hide();
    m_rotCenter->hide();
    m_rotHandle->hide();
}

// ---------------------------------------------------------------------------
// Limpieza
// ---------------------------------------------------------------------------

void SvgView::clear()
{
    clearAnimations();
    m_scene->clear();              // elimina todos los items graficos
    qDeleteAll(m_elements);        // libera memoria de los SvgElement
    m_elements.clear();
    m_selectedElement = nullptr;
    m_svgRoot         = nullptr;
    m_renderer        = nullptr;
    m_dragElement     = nullptr;
    m_history.clear();
    m_historyIndex = -1;
    m_hasCopiedConfig = false;
    m_rotating = false;
    m_dragging = false;

    // Re-crear asas de rotacion (m_scene->clear() las elimino)
    QPen rotPen(QColor("#6c5ce7"), 2);
    m_rotLine = m_scene->addLine(0, 0, 0, 0, rotPen);
    m_rotLine->setZValue(9998);
    m_rotLine->hide();

    m_rotCenter = m_scene->addEllipse(0, 0, 8, 8,
        QPen(QColor("#6c5ce7"), 2), QBrush(QColor("#6c5ce7")));
    m_rotCenter->setZValue(9999);
    m_rotCenter->hide();

    m_rotHandle = m_scene->addEllipse(0, 0, 16, 16,
        QPen(QColor("#6c5ce7"), 2),
        QBrush(QColor(108, 92, 231, 60)));
    m_rotHandle->setCursor(Qt::CrossCursor);
    m_rotHandle->setZValue(10000);
    m_rotHandle->hide();
}

// ---------------------------------------------------------------------------
// Carga de SVG
// ---------------------------------------------------------------------------

bool SvgView::loadSvg(const QString &filePath)
{
    QFile file(filePath);
    if (!file.open(QIODevice::ReadOnly)) return false;
    QString content = file.readAll();
    file.close();
    m_currentFilePath = filePath;
    return loadSvgString(content);
}

bool SvgView::loadSvgString(const QString &svgContent)
{
    clear();

    QDomDocument doc;
    if (!doc.setContent(svgContent)) return false;

    QDomElement root = doc.documentElement();
    if (root.tagName() != "svg") return false;

    parseSvgElements(doc);

    fitSvg();
    emit elementsChanged();
    pushHistory();
    return true;
}

// ---------------------------------------------------------------------------
// Parseo de elementos SVG
// ---------------------------------------------------------------------------

void SvgView::parseSvgElements(const QDomDocument &doc)
{
    // ---- Renderizador del SVG completo (fondo) ----
    m_renderer = new QSvgRenderer(doc.toByteArray(), this);

    auto *bgItem = new QGraphicsSvgItem();
    bgItem->setSharedRenderer(m_renderer);
    bgItem->setPos(0, 0);
    bgItem->setZValue(-1);   // fondo detras de todo
    m_scene->addItem(bgItem);
    m_svgRoot = bgItem;

    // ---- Extraer elementos hijo del SVG ----
    QDomElement root = doc.documentElement();
    QDomNodeList children = root.childNodes();

    // Etiquetas que consideramos "piezas" animables
    static const QStringList validTags = {
        "circle", "rect", "ellipse", "path", "line",
        "polyline", "polygon", "g", "text"
    };

    int idx = 0;
    for (int i = 0; i < children.size(); ++i) {
        QDomElement el = children.at(i).toElement();
        if (el.isNull()) continue;
        if (!validTags.contains(el.tagName())) continue;

        auto *svgEl   = new SvgElement();
        svgEl->index  = idx;
        svgEl->tagName = el.tagName();
        svgEl->id     = el.attribute("id");
        svgEl->elementXml = elementXml(el);

        // Calcular rectangulo aproximado desde atributos
        const QString &tag = svgEl->tagName;
        if (tag == "circle") {
            double cx = el.attribute("cx", "100").toDouble();
            double cy = el.attribute("cy", "100").toDouble();
            double r  = el.attribute("r", "50").toDouble();
            svgEl->bounds = QRectF(cx - r, cy - r, r * 2, r * 2);
        } else if (tag == "rect") {
            double x = el.attribute("x", "0").toDouble();
            double y = el.attribute("y", "0").toDouble();
            double w = el.attribute("width", "50").toDouble();
            double h = el.attribute("height", "50").toDouble();
            svgEl->bounds = QRectF(x, y, w, h);
        } else if (tag == "ellipse") {
            double cx = el.attribute("cx", "100").toDouble();
            double cy = el.attribute("cy", "100").toDouble();
            double rx = el.attribute("rx", "50").toDouble();
            double ry = el.attribute("ry", "50").toDouble();
            svgEl->bounds = QRectF(cx - rx, cy - ry, rx * 2, ry * 2);
        } else if (tag == "line") {
            double x1 = el.attribute("x1", "0").toDouble();
            double y1 = el.attribute("y1", "0").toDouble();
            double x2 = el.attribute("x2", "100").toDouble();
            double y2 = el.attribute("y2", "100").toDouble();
            svgEl->bounds = QRectF(qMin(x1, x2), qMin(y1, y2),
                                   qAbs(x2 - x1), qAbs(y2 - y1));
        } else if (tag == "path" || tag == "g" || tag == "polyline" ||
                   tag == "polygon" || tag == "text") {
            svgEl->bounds = QRectF(0, 0, SVG_W, SVG_H);
        }

        m_elements.append(svgEl);

        // ---- Crear item individual ----
        QSvgRenderer *r = new QSvgRenderer(svgEl->elementXml.toUtf8(), this);

        auto *item = new QGraphicsSvgItem();
        item->setSharedRenderer(r);
        item->setPos(0, 0);              // <<< IMPORTANTE: posicion (0,0)
                                         // El SVG interno ya contiene las
                                         // coordenadas correctas del elemento.
        item->setCacheMode(QGraphicsItem::NoCache);
        item->setFlags(QGraphicsItem::ItemIsSelectable);
        item->setZValue(idx + 1);        // orden de apilamiento
        m_scene->addItem(item);

        svgEl->item = item;
        svgEl->origParent = m_svgRoot;
        ++idx;
    }
}

// ---------------------------------------------------------------------------
// Generar XML individual para un elemento
// ---------------------------------------------------------------------------

QString SvgView::elementXml(const QDomElement &el) const
{
    QString elementStr;
    QTextStream ts(&elementStr);
    el.save(ts, 2);

    QString viewBox = QString("viewBox=\"0 0 %1 %2\"")
                      .arg(SVG_W).arg(SVG_H);
    return QString("<svg xmlns=\"http://www.w3.org/2000/svg\" %1>%2</svg>")
           .arg(viewBox, elementStr);
}

// ---------------------------------------------------------------------------
// Seleccion
// ---------------------------------------------------------------------------

int SvgView::selectedIndex() const
{
    for (int i = 0; i < m_elements.size(); ++i)
        if (m_elements[i] == m_selectedElement) return i;
    return -1;
}

void SvgView::selectElement(int index)
{
    if (index >= 0 && index < m_elements.size())
        selectElement(m_elements[index]);
    else
        selectElement(nullptr);
}

void SvgView::selectElement(SvgElement *el)
{
    m_selectedElement = el;
    if (el) {
        updateRotationHandle();
        emit elementSelected(el->index);
    } else {
        hideRotationHandle();
        emit elementSelected(-1);
    }
}

// ======================================================================
// Historial / Undo / Redo
// ======================================================================

void SvgView::pushHistory()
{
    // Eliminar entradas futuras (redo) si las hay
    m_history.resize(m_historyIndex + 1);

    AnimHistoryEntry entry;
    for (auto *el : m_elements)
        entry.anims[el->index] = el->anim;

    m_history.append(entry);
    if (m_history.size() > MAX_HISTORY) m_history.removeFirst();
    m_historyIndex = m_history.size() - 1;
    emit historyChanged();
}

void SvgView::undo()
{
    if (m_historyIndex <= 0) return;
    --m_historyIndex;
    const auto &entry = m_history[m_historyIndex];
    for (auto *el : m_elements) {
        if (entry.anims.contains(el->index)) {
            el->anim = entry.anims[el->index];
            if (el->item) {
                el->item->setRotation(el->anim.visualRotation);
                el->item->setPos(el->anim.visualPosition);
            }
        }
    }
    applyAllAnimations();
    if (m_selectedElement)
        emit elementSelected(m_selectedElement->index);
    emit historyChanged();
}

void SvgView::redo()
{
    if (m_historyIndex >= m_history.size() - 1) return;
    ++m_historyIndex;
    const auto &entry = m_history[m_historyIndex];
    for (auto *el : m_elements) {
        if (entry.anims.contains(el->index)) {
            el->anim = entry.anims[el->index];
            if (el->item) {
                el->item->setRotation(el->anim.visualRotation);
                el->item->setPos(el->anim.visualPosition);
            }
        }
    }
    applyAllAnimations();
    if (m_selectedElement)
        emit elementSelected(m_selectedElement->index);
    emit historyChanged();
}

// ======================================================================
// Copiar / Pegar / Eliminar / Duplicar
// ======================================================================

void SvgView::copyElementConfig()
{
    int idx = selectedIndex();
    if (idx < 0) return;
    m_copiedConfig = m_elements[idx]->anim;
    m_hasCopiedConfig = true;
}

void SvgView::pasteElementConfig()
{
    if (!m_hasCopiedConfig) return;
    int idx = selectedIndex();
    if (idx < 0) return;
    pushHistory();
    m_elements[idx]->anim = m_copiedConfig;
    applyAnimation(idx);
    emit elementSelected(idx);
}

void SvgView::deleteElement()
{
    int idx = selectedIndex();
    if (idx < 0) return;
    pushHistory();

    auto *el = m_elements[idx];
    if (el->item) {
        m_scene->removeItem(el->item);
        delete el->item;
    }
    m_elements.removeAt(idx);
    delete el;

    // Re-indexar
    for (int i = 0; i < m_elements.size(); ++i)
        m_elements[i]->index = i;

    // Re-construir historial (los indices cambiaron)
    m_history.clear();
    m_historyIndex = -1;

    // Limpiar animaciones del elemento eliminado
    if (m_animations.contains(idx)) {
        auto *a = m_animations.take(idx);
        a->stop();
        delete a;
    }
    // Desplazar animaciones
    QMap<int, QPropertyAnimation*> newAnims;
    for (auto it = m_animations.begin(); it != m_animations.end(); ++it) {
        int k = it.key();
        if (k > idx) newAnims[k - 1] = it.value();
        else newAnims[k] = it.value();
    }
    m_animations = newAnims;

    if (m_elements.isEmpty()) {
        m_selectedElement = nullptr;
    } else {
        int newIdx = qMin(idx, m_elements.size() - 1);
        selectElement(newIdx);
    }
    emit elementsChanged();
    pushHistory();
}

void SvgView::duplicateElement()
{
    int idx = selectedIndex();
    if (idx < 0) return;
    pushHistory();

    auto *orig = m_elements[idx];
    auto *dup = new SvgElement(*orig);
    dup->index = m_elements.size();

    // Clonar el item grafico
    if (orig->item) {
        QSvgRenderer *r = new QSvgRenderer(orig->elementXml.toUtf8(), this);
        auto *item = new QGraphicsSvgItem();
        item->setSharedRenderer(r);
        item->setPos(orig->item->pos());
        item->setRotation(orig->item->rotation());
        item->setScale(orig->item->scale());
        item->setOpacity(orig->item->opacity());
        item->setZValue(m_elements.size() + 1);
        item->setFlags(QGraphicsItem::ItemIsSelectable);
        m_scene->addItem(item);
        dup->item = item;
        dup->origParent = orig->origParent;
    }

    m_elements.append(dup);
    selectElement(dup->index);
    emit elementsChanged();
    pushHistory();
}

// ---------------------------------------------------------------------------
// Animacion
// ---------------------------------------------------------------------------

void SvgView::clearAnimations()
{
    if (m_animGroup) {
        m_animGroup->stop();
        delete m_animGroup;
        m_animGroup = nullptr;
    }
    for (auto *anim : m_animations) delete anim;
    m_animations.clear();
    m_playing = false;

    // Restaurar estado inicial de todos los elementos
    for (auto *el : m_elements) {
        if (el->item) {
            el->item->setPos(0, 0);
            el->item->setRotation(0);
            el->item->setScale(1);
            el->item->setOpacity(1.0);
        }
    }
}

void SvgView::applyAnimation(int index)
{
    if (index < 0 || index >= m_elements.size()) return;
    SvgElement *el = m_elements[index];
    if (!el->item) return;

    // Eliminar animacion previa para este elemento
    if (m_animations.contains(index)) {
        auto *old = m_animations.take(index);
        old->stop();
        delete old;
    }

    // Punto de origen de transformacion: centro del elemento
    el->item->setTransformOriginPoint(el->bounds.center());

    double dur   = qMax(0.1, el->anim.speed);
    int    repeat = el->anim.repeatCount;
    double angle = el->anim.directionAngle;
    double rad   = angle * M_PI / 180.0;
    double cosA  = qCos(rad);
    double sinA  = qSin(rad);

    const QStringList &pids = el->anim.presetIds;

    // Funciones auxiliares
    auto makePosAnim = [&]() -> QPropertyAnimation* {
        return new QPropertyAnimation(static_cast<QObject*>(el->item), "pos", this);
    };
    auto makeRotAnim = [&]() -> QPropertyAnimation* {
        return new QPropertyAnimation(static_cast<QObject*>(el->item), "rotation", this);
    };
    auto makeScaleAnim = [&]() -> QPropertyAnimation* {
        return new QPropertyAnimation(static_cast<QObject*>(el->item), "scale", this);
    };
    auto makeOpacityAnim = [&]() -> QPropertyAnimation* {
        return new QPropertyAnimation(static_cast<QObject*>(el->item), "opacity", this);
    };

    // Revisar que propiedades estan ocupadas para evitar conflictos
    bool hasPos = false, hasRot = false, hasScale = false, hasOpacity = false;
    auto propertyUsed = [&](const QString &prop) {
        if (prop == "pos") return hasPos;
        if (prop == "rotation") return hasRot;
        if (prop == "scale") return hasScale;
        if (prop == "opacity") return hasOpacity;
        return false;
    };
    auto markUsed = [&](const QString &prop) {
        if (prop == "pos") hasPos = true;
        else if (prop == "rotation") hasRot = true;
        else if (prop == "scale") hasScale = true;
        else if (prop == "opacity") hasOpacity = true;
    };

    // Restaurar estado neutro para propiedades no usadas por ningun preset
    auto resetNeutral = [&]() {
        if (!hasRot) el->item->setRotation(el->anim.visualRotation);
        if (!hasScale) el->item->setScale(1);
        if (!hasOpacity) el->item->setOpacity(1.0);
        if (!hasPos) el->item->setPos(el->anim.visualPosition);
    };

    // Recolectar animaciones de todos los presets activos
    QVector<QAbstractAnimation*> anims;

    for (const QString &pid : pids) {
        if (pid == "rotate" && !propertyUsed("rotation")) {
            auto *a = makeRotAnim();
            a->setDuration(int(dur * 1000));
            a->setStartValue(0.0); a->setEndValue(360.0);
            anims.append(a); markUsed("rotation");
        } else if (pid == "wheel" && !propertyUsed("rotation")) {
            auto *a = makeRotAnim();
            a->setDuration(int(dur * 1000));
            a->setKeyValueAt(0.00, 0.0); a->setKeyValueAt(0.25, 90.0);
            a->setKeyValueAt(0.50, 180.0); a->setKeyValueAt(0.75, 270.0);
            a->setKeyValueAt(1.00, 360.0);
            anims.append(a); markUsed("rotation");
        } else if (pid == "pulse" && !propertyUsed("scale")) {
            auto *a = makeScaleAnim();
            a->setDuration(int(dur * 1000));
            a->setKeyValueAt(0.0, 1.0); a->setKeyValueAt(0.5, 1.15); a->setKeyValueAt(1.0, 1.0);
            anims.append(a); markUsed("scale");
        } else if (pid == "spin" && !propertyUsed("rotation") && !propertyUsed("scale")) {
            // Spin usa rotation + scale juntos
            auto *g = new QParallelAnimationGroup(this);
            auto *r = makeRotAnim();
            r->setDuration(int(dur * 1000));
            r->setKeyValueAt(0.0, 0.0); r->setKeyValueAt(0.5, 180.0); r->setKeyValueAt(1.0, 360.0);
            g->addAnimation(r);
            auto *s = makeScaleAnim();
            s->setDuration(int(dur * 1000));
            s->setKeyValueAt(0.0, 1.0); s->setKeyValueAt(0.5, 0.85); s->setKeyValueAt(1.0, 1.0);
            g->addAnimation(s);
            anims.append(g); markUsed("rotation"); markUsed("scale");
        } else if ((pid == "bounce" || pid == "gravity" || pid == "slide" ||
                    pid == "oval" || pid == "shake" || pid == "float") && !propertyUsed("pos")) {
            double dx=0, dy=0;
            if (pid == "bounce")   { dx = 20*cosA; dy = -20*sinA; }
            else if (pid == "float") { dx = 15*cosA; dy = -15*sinA; }
            else if (pid == "slide") { dx = 80*cosA; dy = -80*sinA; }
            else if (pid == "shake") { dx = 8*cosA;  dy = -8*sinA; }

            auto *a = makePosAnim();
            a->setDuration(int(dur * 1000));
            if (pid == "bounce" || pid == "float") {
                a->setKeyValueAt(0.0, QPointF(0, 0));
                a->setKeyValueAt(0.5, QPointF(dx, dy));
                a->setKeyValueAt(1.0, QPointF(0, 0));
            } else if (pid == "slide") {
                a->setKeyValueAt(0.0, QPointF(-dx, -dy));
                a->setKeyValueAt(0.5, QPointF(dx, dy));
                a->setKeyValueAt(1.0, QPointF(-dx, -dy));
            } else if (pid == "shake") {
                a->setKeyValueAt(0.00, QPointF(0, 0));
                a->setKeyValueAt(0.10, QPointF(-dx, -dy));
                a->setKeyValueAt(0.20, QPointF(dx, dy));
                a->setKeyValueAt(0.30, QPointF(-dx, -dy));
                a->setKeyValueAt(0.40, QPointF(dx, dy));
                a->setKeyValueAt(0.50, QPointF(-dx, -dy));
                a->setKeyValueAt(0.60, QPointF(dx, dy));
                a->setKeyValueAt(0.70, QPointF(-dx, -dy));
                a->setKeyValueAt(0.80, QPointF(dx, dy));
                a->setKeyValueAt(0.90, QPointF(-dx, -dy));
                a->setKeyValueAt(1.00, QPointF(0, 0));
            } else if (pid == "gravity") {
                a->setKeyValueAt(0.00, QPointF(-100*cosA, -100*sinA));
                a->setKeyValueAt(0.30, QPointF(80*cosA, 80*sinA));
                a->setKeyValueAt(0.50, QPointF(-40*cosA, -40*sinA));
                a->setKeyValueAt(0.70, QPointF(30*cosA, 30*sinA));
                a->setKeyValueAt(0.85, QPointF(-10*cosA, -10*sinA));
                a->setKeyValueAt(1.00, QPointF(0, 0));
            } else if (pid == "oval") {
                double rx = el->anim.ovalRx, ry = el->anim.ovalRy;
                a->setKeyValueAt(0.00, QPointF(0, 0));
                a->setKeyValueAt(0.25, QPointF(rx, 0));
                a->setKeyValueAt(0.50, QPointF(0, ry));
                a->setKeyValueAt(0.75, QPointF(-rx, 0));
                a->setKeyValueAt(1.00, QPointF(0, 0));
            }
            anims.append(a); markUsed("pos");
        } else if ((pid == "fade" || pid == "glow") && !propertyUsed("opacity")) {
            auto *a = makeOpacityAnim();
            a->setDuration(int(dur * 1000));
            if (pid == "fade") {
                a->setKeyValueAt(0.0, 1.0); a->setKeyValueAt(0.5, 0.15); a->setKeyValueAt(1.0, 1.0);
            } else {
                a->setKeyValueAt(0.0, 0.7); a->setKeyValueAt(0.5, 1.0); a->setKeyValueAt(1.0, 0.7);
            }
            anims.append(a); markUsed("opacity");
        }
    }

    // Restaurar neutrales
    resetNeutral();

    // Si no hay animaciones, restaurar estado inicial
    if (anims.isEmpty()) {
        el->item->setPos(0, 0);
        el->item->setRotation(0);
        el->item->setScale(1);
        el->item->setOpacity(1.0);
        return;
    }

    // Si hay una sola animacion, usarla directamente
    QAbstractAnimation *finalAnim;
    if (anims.size() == 1) {
        finalAnim = anims[0];
    } else {
        auto *group = new QParallelAnimationGroup(this);
        for (auto *a : anims) group->addAnimation(a);
        finalAnim = group;
    }

    if (auto *pa = qobject_cast<QPropertyAnimation*>(finalAnim)) {
        pa->setLoopCount(repeat);
        if (el->anim.direction == "reverse")
            pa->setDirection(QAbstractAnimation::Backward);
    } else if (auto *pg = qobject_cast<QParallelAnimationGroup*>(finalAnim)) {
        for (int i = 0; i < pg->animationCount(); ++i) {
            auto *pa2 = qobject_cast<QPropertyAnimation*>(pg->animationAt(i));
            if (pa2) {
                pa2->setLoopCount(repeat);
                if (el->anim.direction == "reverse")
                    pa2->setDirection(QAbstractAnimation::Backward);
            }
        }
    }

    m_animations.insert(index, reinterpret_cast<QPropertyAnimation*>(finalAnim));
    m_playing = true;
    finalAnim->start();
}

void SvgView::applyAllAnimations()
{
    for (int i = 0; i < m_elements.size(); ++i)
        applyAnimation(i);
}

void SvgView::playAll()
{
    m_playing = true;
    for (auto *anim : m_animations) {
        if (anim->state() != QAbstractAnimation::Running)
            anim->start();
    }
}

void SvgView::pauseAll()
{
    m_playing = false;
    for (auto *anim : m_animations) {
        if (anim->state() == QAbstractAnimation::Running)
            anim->pause();
    }
}

void SvgView::resetAll()
{
    clearAnimations();
}

// ---------------------------------------------------------------------------
// Modo piezas (arrastrar elementos individualmente)
// ---------------------------------------------------------------------------

void SvgView::setPiecesMode(bool on)
{
    m_piecesMode = on;
    if (!on) {
        m_dragElement = nullptr;
        m_dragging    = false;
        // Ocultar contornos
        for (auto *r : m_pieceOutlines) { r->hide(); }
        return;
    }
    // Mostrar contorno de cada pieza
    // Re-crear contornos si es necesario
    for (auto *r : m_pieceOutlines) { delete r; }
    m_pieceOutlines.clear();

    QPen outlinePen(QColor(108, 92, 231, 80), 1.5, Qt::DashLine);
    for (auto *el : m_elements) {
        if (!el->item) continue;
        QRectF bounds = el->item->boundingRect();
        QPointF pos = el->item->scenePos();
        auto *rect = m_scene->addRect(
            pos.x() + bounds.x(), pos.y() + bounds.y(),
            bounds.width(), bounds.height(),
            outlinePen);
        rect->setZValue(9997); // just below rotation handle
        rect->show();
        m_pieceOutlines.append(rect);
    }
}

void SvgView::mousePressEvent(QMouseEvent *event)
{
    QPointF scenePos = mapToScene(event->pos());

    // ---- Detectar clic en el asa de rotacion ----
    if (m_selectedElement && m_rotHandle->isVisible()) {
        QRectF handleRect(m_rotHandle->scenePos(),
                          m_rotHandle->boundingRect().size());
        if (handleRect.contains(scenePos)) {
            m_rotating = true;
            m_rotStartPos = scenePos;
            m_rotStartAngle = m_selectedElement->item->rotation();
            return;
        }
    }

    // ---- Detectar clic en un elemento SVG ----
    for (int i = m_elements.size() - 1; i >= 0; --i) {
        SvgElement *el = m_elements[i];
        if (!el->item || !el->item->isVisible()) continue;
        if (el->item->contains(el->item->mapFromScene(scenePos))) {
            selectElement(el);
            m_dragElement = el;
            m_dragStart   = scenePos;
            m_dragging    = false;
            return;
        }
    }

    // Si no se clickeo ningun elemento, desseleccionar
    selectElement(nullptr);

    QGraphicsView::mousePressEvent(event);
}

void SvgView::mouseMoveEvent(QMouseEvent *event)
{
    QPointF scenePos = mapToScene(event->pos());

    // ---- Rotacion ----
    if (m_rotating && m_selectedElement && m_selectedElement->item) {
        auto *item = m_selectedElement->item;
        QRectF bounds = item->boundingRect();
        QPointF center = item->scenePos() + bounds.center();
        double dx = scenePos.x() - center.x();
        double dy = scenePos.y() - center.y();
        double angle = qRadiansToDegrees(qAtan2(dx, -dy));
        item->setRotation(angle);
        // Actualizar la configuracion visual
        m_selectedElement->anim.visualRotation = angle;
        m_selectedElement->anim.visualPosition = item->pos();
        updateRotationHandle();
        return;
    }

    // ---- Arrastre ----
    if (m_dragElement && (event->buttons() & Qt::LeftButton)) {
        QPointF delta = scenePos - m_dragStart;
        if (delta.manhattanLength() > 5) m_dragging = true;
        if (m_dragging) {
            m_dragElement->item->setPos(m_dragElement->item->pos() + delta);
            m_dragElement->anim.visualPosition = m_dragElement->item->pos();
            m_dragStart = scenePos;
        }
        return;
    }
    QGraphicsView::mouseMoveEvent(event);
}

void SvgView::mouseReleaseEvent(QMouseEvent *event)
{
    if (m_rotating) {
        m_rotating = false;
        return;
    }
    if (m_dragging) {
        m_dragging    = false;
        m_dragElement = nullptr;
        return;
    }
    QGraphicsView::mouseReleaseEvent(event);
}

void SvgView::keyPressEvent(QKeyEvent *event)
{
    if (event->key() == Qt::Key_Escape && m_piecesMode && m_selectedElement) {
        m_selectedElement->item->setPos(0, 0);
        m_selectedElement = nullptr;
        m_dragElement     = nullptr;
    }
    QGraphicsView::keyPressEvent(event);
}

// ---------------------------------------------------------------------------
// Drag & Drop
// ---------------------------------------------------------------------------

void SvgView::dragEnterEvent(QDragEnterEvent *event)
{
    if (event->mimeData()->hasUrls())
        event->acceptProposedAction();
}

void SvgView::dragMoveEvent(QDragMoveEvent *event)
{
    if (event->mimeData()->hasUrls())
        event->acceptProposedAction();
}

void SvgView::dropEvent(QDropEvent *event)
{
    const auto urls = event->mimeData()->urls();
    for (const auto &url : urls) {
        QString path = url.toLocalFile();
        if (path.endsWith(".svg", Qt::CaseInsensitive)) {
            loadSvg(path);
            break;
        }
    }
}

// ---------------------------------------------------------------------------
// Exportacion a SVG animado con CSS embebido
// ---------------------------------------------------------------------------

QString SvgView::exportAnimatedSvg() const
{
    QFile file(m_currentFilePath);
    QString svgContent;
    if (file.open(QIODevice::ReadOnly))
        svgContent = file.readAll();

    if (svgContent.isEmpty())
        svgContent = "<svg xmlns=\"http://www.w3.org/2000/svg\" "
                     "viewBox=\"0 0 200 200\"></svg>";

    // Helper: generate keyframe CSS for a given preset
    auto makeKeyframes = [](const QString &kfName, const QString &pid,
                            double angle, double ovalRx, double ovalRy) -> QString {
        double rad  = angle * M_PI / 180.0;
        double cosA = qCos(rad), sinA = qSin(rad);
        double dx, dy;
        auto kfTemplate = [&](const QString &tmpl) {
            return QString(tmpl).arg(kfName);
        };
        if (pid == "rotate") {
            return QString("@keyframes %1 { from { transform: rotate(0deg); }"
                           " to { transform: rotate(360deg); } }").arg(kfName);
        }
        if (pid == "pulse") {
            return QString("@keyframes %1 { 0%%,100%% { transform: scale(1); }"
                           " 50%% { transform: scale(1.15); } }").arg(kfName);
        }
        if (pid == "fade") {
            return QString("@keyframes %1 { 0%%,100%% { opacity: 1; }"
                           " 50%% { opacity: 0.15; } }").arg(kfName);
        }
        if (pid == "spin") {
            return QString("@keyframes %1 { 0%% { transform: rotate(0deg)"
                           " scale(1); } 50%% { transform: rotate(180deg)"
                           " scale(0.85); } 100%% { transform: rotate(360deg)"
                           " scale(1); } }").arg(kfName);
        }
        if (pid == "wheel") {
            return QString("@keyframes %1 { 0%% { transform: rotate(0deg); }"
                           " 25%% { transform: rotate(90deg); }"
                           " 50%% { transform: rotate(180deg); }"
                           " 75%% { transform: rotate(270deg); }"
                           " 100%% { transform: rotate(360deg); } }").arg(kfName);
        }
        if (pid == "glow") {
            return QString("@keyframes %1 { 0%%,100%% {"
                           " filter: drop-shadow(0 0 4px rgba(108,92,231,0.3)); }"
                           " 50%% { filter: drop-shadow(0 0 24px"
                           " rgba(108,92,231,0.9)); } }").arg(kfName);
        }
        if (pid == "oval") {
            return QString("@keyframes %1 { 0%% { transform: translate(0,0); }"
                           " 25%% { transform: translate(%2px,0); }"
                           " 50%% { transform: translate(0,%3px); }"
                           " 75%% { transform: translate(-%2px,0); }"
                           " 100%% { transform: translate(0,0); } }")
                   .arg(kfName).arg(ovalRx).arg(ovalRy);
        }
        if (pid == "bounce") {
            dx = 20*cosA; dy = -20*sinA;
            return QString("@keyframes %1 { 0%%,100%% { transform:"
                           " translate(0,0); }"
                           " 50%% { transform: translate(%2px,%3px); } }")
                   .arg(kfName).arg(dx).arg(dy);
        }
        if (pid == "slide") {
            dx = 80*cosA; dy = -80*sinA;
            return QString("@keyframes %1 {"
                           " 0%%,100%% { transform: translate(%2px,%3px); }"
                           " 50%% { transform: translate(%4px,%5px); } }")
                   .arg(kfName).arg(-dx).arg(-dy).arg(dx).arg(dy);
        }
        if (pid == "shake") {
            dx = 8*cosA; dy = -8*sinA;
            return QString("@keyframes %1 {"
                           " 0%%,100%% { transform: translate(0,0); }"
                           " 10%%,30%%,50%%,70%%,90%%"
                           " { transform: translate(%2px,%3px); }"
                           " 20%%,40%%,60%%,80%%"
                           " { transform: translate(%4px,%5px); } }")
                   .arg(kfName).arg(-dx).arg(-dy).arg(dx).arg(dy);
        }
        if (pid == "float") {
            dx = 15*cosA; dy = -15*sinA;
            return QString("@keyframes %1 { 0%%,100%% { transform:"
                           " translate(0,0); }"
                           " 50%% { transform: translate(%2px,%3px); } }")
                   .arg(kfName).arg(dx).arg(dy);
        }
        if (pid == "gravity") {
            double dx1=-100*cosA, dy1=-100*sinA;
            double dx2= 80*cosA,  dy2= 80*sinA;
            double dx3=-40*cosA,  dy3=-40*sinA;
            double dx4= 30*cosA,  dy4= 30*sinA;
            double dx5=-10*cosA,  dy5=-10*sinA;
            return QString("@keyframes %1 {"
                           " 0%% { transform: translate(%2px,%3px); }"
                           " 30%% { transform: translate(%4px,%5px); }"
                           " 50%% { transform: translate(%6px,%7px); }"
                           " 70%% { transform: translate(%8px,%9px); }"
                           " 85%% { transform: translate(%10px,%11px); }"
                           " 100%% { transform: translate(0,0); } }")
                   .arg(kfName).arg(dx1).arg(dy1).arg(dx2).arg(dy2)
                   .arg(dx3).arg(dy3).arg(dx4).arg(dy4).arg(dx5).arg(dy5);
        }
        return {};
    };

    QString css, rules;
    int elIdx = 0;
    int globalPidCounter = 0;
    for (auto *el : m_elements) {
        if (el->anim.presetIds.isEmpty()) { ++elIdx; continue; }

        double dur  = qMax(0.1, el->anim.speed);
        QString iter = el->anim.repeatCount < 0
                       ? "infinite"
                       : QString::number(el->anim.repeatCount);

        QStringList animValues;
        for (const QString &pid : el->anim.presetIds) {
            const AnimPreset *preset = findPreset(pid);
            if (!preset) continue;

            QString kfName = "anim" + QString::number(globalPidCounter++);
            QString kfBody = makeKeyframes(kfName, pid,
                                           el->anim.directionAngle,
                                           el->anim.ovalRx, el->anim.ovalRy);
            if (kfBody.isEmpty()) continue;
            css += kfBody + "\n";
            animValues << QString("%1 %2s ease-in-out %3 normal")
                              .arg(kfName).arg(dur).arg(iter);
        }

        if (animValues.isEmpty()) { ++elIdx; continue; }

        QString ovalVars;
        if (el->anim.presetIds.contains("oval"))
            ovalVars = QString("--oval-rx:%1px;--oval-ry:%2px;")
                       .arg(el->anim.ovalRx).arg(el->anim.ovalRy);
        QString drawExtra;
        if (el->anim.presetIds.contains("draw"))
            drawExtra = " stroke-dasharray:1000;--path-length:1000;";

        rules += QString("%1:nth-child(%2) {"
                         " transform-origin:center center;"
                         " transform-box:fill-box;"
                         " %3%4"
                         " animation: %5;"
                         " animation-delay:%6s; }\n")
                 .arg(el->tagName)
                 .arg(elIdx + 1)
                 .arg(ovalVars)
                 .arg(drawExtra)
                 .arg(animValues.join(", "))
                  .arg(el->anim.delay);
        ++elIdx;
    }

    // Inyectar <style> dentro del SVG
    QString styleBlock = "<style>\n" + css + "\n" + rules + "</style>";
    int insertPos = svgContent.indexOf('>', svgContent.indexOf("<svg")) + 1;
    QString result = svgContent.left(insertPos) + "\n" + styleBlock
                     + svgContent.mid(insertPos);
    return result;
}
