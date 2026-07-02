#ifndef SVGVIEW_H
#define SVGVIEW_H

/**
 *  @file  SvgView.h
 *  @brief Visor SVG con animaciones por elemento, modo piezas y exportacion.
 *
 *  Carga un archivo SVG, descompone sus elementos hijos en piezas
 *  individuales (QGraphicsSvgItem) y permite aplicar animaciones
 *  independientes a cada pieza mediante QPropertyAnimation.
 *
 *  Funcionalidades:
 *    - Carga por archivo o drag-and-drop
 *    - Animacion simultanea e independiente por pieza
 *    - Modo "piezas" para arrastrar elementos con el raton
 *    - Exportacion a SVG con CSS animado embebido
 */

#include <QGraphicsView>
#include <QGraphicsScene>
#include <QGraphicsSvgItem>
#include <QDomDocument>
#include <QSvgRenderer>
#include <QPropertyAnimation>
#include <QParallelAnimationGroup>
#include <QMap>
#include <QVector>
#include <QGraphicsEllipseItem>
#include <QGraphicsRectItem>
#include <QGraphicsLineItem>

// ---------------------------------------------------------------------------
// Estructura: datos de animacion por elemento
// ---------------------------------------------------------------------------

/// @brief  Configuracion de animacion individual para cada pieza SVG
struct ElementAnimData {
    QStringList presetIds;       ///< IDs de presets activos ("rotate", "fade"...)
    double  speed        = 1.0;  ///< Duracion total en segundos
    double  delay        = 0.0;  ///< Retardo antes de iniciar (s)
    int     repeatCount  = -1;   ///< Repeticiones (-1 = infinito)
    QString direction    = "normal";  ///< "normal", "reverse" o "alternate"
    double  directionAngle = 0.0;     ///< Angulo de direccion (grados)
    double  ovalRx       = 80;    ///< Radio X para animacion oval
    double  ovalRy       = 40;    ///< Radio Y para animacion oval
    double  ovalAngle    = 0;     ///< Rotacion del ovalo (grados)
    double  visualRotation   = 0;  ///< Rotacion visual independiente (arrastre)
    QPointF visualPosition;          ///< Posicion visual independiente (arrastre)
};

// ---------------------------------------------------------------------------
// Estructura: elemento SVG parsedo
// ---------------------------------------------------------------------------

/// @brief  Representa una pieza individual dentro del SVG
struct SvgElement {
    int         index;       ///< Indice en el vector global
    QString     tagName;     ///< Nombre de la etiqueta ("circle", "rect"…)
    QString     id;          ///< Atributo id (si existe)
    QString     elementXml;  ///< SVG autonómo del elemento (para QSvgRenderer)
    QRectF      bounds;      ///< Rectangulo que ocupa en el SVG original
    QGraphicsSvgItem *item  = nullptr;  ///< Item grafico en la escena
    QGraphicsItem     *origParent = nullptr; ///< Padre original (reservado)
    ElementAnimData    anim;          ///< Configuracion de animacion activa
    bool visible = true;
};

// ---------------------------------------------------------------------------
// Clase SvgView
// ---------------------------------------------------------------------------

class SvgView : public QGraphicsView
{
    Q_OBJECT

public:
    explicit SvgView(QWidget *parent = nullptr);

    /// @brief  Carga un archivo SVG desde disco
    bool loadSvg(const QString &filePath);

    /// @brief  Carga SVG desde un string (usado por drag-and-drop)
    bool loadSvgString(const QString &svgContent);

    /// @brief  Limpia escena, animaciones y elementos
    void clear();

    // -- Acceso a elementos ------------------------------------------------
    const QVector<SvgElement*>& elements() const { return m_elements; }
    SvgElement *selectedElement() const { return m_selectedElement; }
    int  selectedIndex() const;

    /// @brief  Selecciona un elemento por indice
    void selectElement(int index);

    /// @brief  Selecciona un elemento por puntero
    void selectElement(SvgElement *el);

    // -- Control de animacion ----------------------------------------------
    void playAll();
    void pauseAll();
    void resetAll();

    /// @brief  Aplica (o actualiza) la animacion del elemento @p index
    void applyAnimation(int index);

    /// @brief  Aplica animaciones a todos los elementos
    void applyAllAnimations();

    // -- Historial / Undo/Redo ---------------------------------------------
    void pushHistory();
    void undo();
    void redo();
    bool canUndo() const { return m_historyIndex > 0; }
    bool canRedo() const { return m_historyIndex < m_history.size() - 1; }

    // -- Copiar / Pegar / Eliminar / Duplicar ------------------------------
    void copyElementConfig();
    void pasteElementConfig();
    void deleteElement();
    void duplicateElement();
    bool hasCopiedConfig() const { return m_hasCopiedConfig; }
    ElementAnimData copiedConfig() const { return m_copiedConfig; }

    // -- Orden Z -----------------------------------------------------------
    void bringToFront();
    void sendToBack();
    void bringForward();
    void sendBackward();

    // -- Modo piezas -------------------------------------------------------
    void setPiecesMode(bool on);
    bool isPiecesMode() const { return m_piecesMode; }

    // -- Exportacion -------------------------------------------------------
    QString exportAnimatedSvg() const;

    // -- Archivos ----------------------------------------------------------
    QString currentFilePath() const { return m_currentFilePath; }
    QStringList availableFiles() const { return m_availableFiles; }

signals:
    void elementSelected(int index);
    void elementsChanged();
    void historyChanged();

public slots:
    void fitSvg();

protected:
    void dragEnterEvent(QDragEnterEvent *event) override;
    void dragMoveEvent(QDragMoveEvent *event) override;
    void dropEvent(QDropEvent *event) override;
    void mousePressEvent(QMouseEvent *event) override;
    void mouseMoveEvent(QMouseEvent *event) override;
    void mouseReleaseEvent(QMouseEvent *event) override;
    void keyPressEvent(QKeyEvent *event) override;

private:
    void updateRotationHandle();
    void hideRotationHandle();

private:
    void parseSvgElements(const QDomDocument &doc);
    QString elementXml(const QDomElement &el) const;
    void clearAnimations();

    // Escena y render
    QGraphicsScene       *m_scene;
    QSvgRenderer         *m_renderer    = nullptr;
    QGraphicsSvgItem     *m_svgRoot     = nullptr;   ///< Fondo SVG completo
    QVector<SvgElement*>  m_elements;
    SvgElement           *m_selectedElement = nullptr;

    // Archivos
    QString     m_currentFilePath;
    QStringList m_availableFiles;

    // Rotacion interactiva
    QGraphicsEllipseItem *m_rotHandle = nullptr;
    QGraphicsLineItem    *m_rotLine   = nullptr;
    QGraphicsEllipseItem *m_rotCenter = nullptr;
    bool       m_rotating    = false;
    QPointF    m_rotStartPos;       ///< Posicion del mouse al iniciar rotacion
    double     m_rotStartAngle;     ///< Angulo del elemento al iniciar rotacion

    // Modo piezas
    bool        m_piecesMode  = false;
    SvgElement *m_dragElement = nullptr;
    QPointF     m_dragStart;       ///< Punto inicial del arrastre (escena)
    bool        m_dragging    = false;
    QVector<QGraphicsRectItem*> m_pieceOutlines;

    // Animaciones
    QParallelAnimationGroup             *m_animGroup = nullptr;
    QMap<int, QPropertyAnimation*>       m_animations;
    bool m_playing = false;

    // Historial
    struct AnimHistoryEntry {
        QMap<int, ElementAnimData> anims;
    };
    QVector<AnimHistoryEntry> m_history;
    int m_historyIndex = -1;
    static const int MAX_HISTORY = 50;

    // Portapapeles de configuracion
    ElementAnimData m_copiedConfig;
    bool m_hasCopiedConfig = false;

    // Dimensiones por defecto del SVG
    static const double SVG_W;
    static const double SVG_H;
};

#endif // SVGVIEW_H
