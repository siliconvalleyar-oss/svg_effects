/**
 *  @file  ElementPanel.cpp
 *  @brief Implementacion del panel lateral de piezas SVG.
 *
 *  Estilo oscuro consistente con el tema general de la aplicacion.
 *  Cada pieza se muestra como un boton con su miniatura renderizada,
 *  nombre y preset asignado.
 */

#include "ElementPanel.h"
#include "SvgView.h"
#include "AnimPresets.h"

#include <QPushButton>
#include <QPainter>
#include <QSvgRenderer>

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

ElementPanel::ElementPanel(SvgView *svgView, QWidget *parent)
    : QWidget(parent)
    , m_svgView(svgView)
{
    // Tema oscuro para todo el panel
    setStyleSheet(
        "ElementPanel { background-color: #1a1d27; }"
        "QScrollArea { background: transparent; border: none; }"
        "QWidget#container { background: transparent; }"
        "QScrollBar:vertical {"
        "  width: 5px; background: #1a1d27;"
        "  border: none; border-radius: 3px; }"
        "QScrollBar::handle:vertical {"
        "  background: #2e3245; border-radius: 3px; min-height: 20px; }"
        "QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {"
        "  height: 0; }"
    );

    auto *outer = new QVBoxLayout(this);
    outer->setContentsMargins(8, 8, 8, 8);
    outer->setSpacing(6);

    // Titulo
    auto *title = new QLabel(QString::fromUtf8("Piezas SVG"));
    title->setStyleSheet(
        "font-size:10px;font-weight:600;text-transform:uppercase;"
        "letter-spacing:1px;color:#8b8fa7;margin-bottom:4px;");
    outer->addWidget(title);

    // Area de scroll
    m_scroll = new QScrollArea(this);
    m_scroll->setWidgetResizable(true);
    m_scroll->setFrameShape(QFrame::NoFrame);

    m_container = new QWidget();
    m_container->setObjectName("container");
    m_layout = new QVBoxLayout(m_container);
    m_layout->setContentsMargins(0, 0, 0, 0);
    m_layout->setSpacing(4);

    // Mensaje cuando no hay elementos cargados
    m_emptyLabel = new QLabel(
        QString::fromUtf8("Carga un archivo SVG\npara ver sus piezas"));
    m_emptyLabel->setStyleSheet(
        "color:#8b8fa7;font-size:10px;padding:16px 8px;");
    m_emptyLabel->setAlignment(Qt::AlignCenter);
    m_layout->addWidget(m_emptyLabel);

    m_scroll->setWidget(m_container);
    outer->addWidget(m_scroll);

    // Conexiones
    connect(m_svgView, &SvgView::elementsChanged,
            this, &ElementPanel::refresh);
    connect(m_svgView, &SvgView::elementSelected,
            this, &ElementPanel::onElementSelected);

    refresh();
}

// ---------------------------------------------------------------------------
// Refrescar lista de elementos
// ---------------------------------------------------------------------------

void ElementPanel::refresh()
{
    const auto &elements = m_svgView->elements();

    // Eliminar botones viejos
    for (auto *btn : m_buttons) {
        m_layout->removeWidget(btn);
        delete btn;
    }
    m_buttons.clear();
    m_emptyLabel->setVisible(elements.isEmpty());

    for (int i = 0; i < elements.size(); ++i) {
        SvgElement *el = elements[i];

        auto *btn = new QPushButton(m_container);
        btn->setFixedHeight(42);
        btn->setCheckable(true);
        btn->setProperty("index", i);

        // Nombre de los presets asignados
        QString presetName = QString::fromUtf8("\u2014");
        QStringList names;
        for (const QString &pid : el->anim.presetIds) {
            const AnimPreset *p = findPreset(pid);
            if (p) names << p->name;
        }
        if (!names.isEmpty()) presetName = names.join(", ");

        // Nombre del elemento
        QString name = el->id.isEmpty()
            ? QString("%1 %2").arg(el->tagName).arg(i + 1)
            : el->id;

        // Generar miniatura con QSvgRenderer
        QPixmap pix(32, 32);
        pix.fill(Qt::transparent);
        QSvgRenderer renderer(el->elementXml.toUtf8());
        QPainter painter(&pix);
        renderer.render(&painter);
        painter.end();

        btn->setIcon(QIcon(pix));
        btn->setIconSize(QSize(24, 24));
        btn->setText(QString(" %1  %2").arg(name, presetName));

        // Estilo oscuro con hover y seleccion
        btn->setStyleSheet(
            "QPushButton {"
            "  text-align:left; padding:6px 8px;"
            "  border:1px solid #2e3245; border-radius:6px;"
            "  background:#242734; color:#e4e6f0; font-size:10px;"
            "}"
            "QPushButton:hover { border-color:#6c5ce7; }"
            "QPushButton:checked {"
            "  border-color:#6c5ce7;"
            "  background:rgba(108,92,231,0.15);"
            "}"
            "QPushButton::menu-indicator { image:none; }");

        connect(btn, &QPushButton::clicked, this, [this, i]() {
            m_svgView->selectElement(i);
        });

        m_layout->addWidget(btn);
        m_buttons.append(btn);
    }

    m_layout->addStretch();
}

// ---------------------------------------------------------------------------
// Slot: seleccion externa
// ---------------------------------------------------------------------------

void ElementPanel::onElementSelected(int index)
{
    for (int i = 0; i < m_buttons.size(); ++i)
        m_buttons[i]->setChecked(i == index);
}
