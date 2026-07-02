#ifndef MAINWINDOW_H
#define MAINWINDOW_H

/**
 *  @file  MainWindow.h
 *  @brief Ventana principal del Animador SVG.
 *
 *  Organiza la interfaz en tres paneles (QSplitter):
 *    - Izquierdo: carga, presets, controles de reproduccion, parametros
 *    - Centro:   visor SVG (SvgView)
 *    - Derecho:  lista de piezas (ElementPanel)
 */

#include <QMainWindow>
#include <QVector>

class QPushButton;
class QSlider;
class QLabel;
class QTimer;
class SvgView;
class ElementPanel;

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = nullptr);

    /// @brief  Carga un archivo SVG (llamado desde main si hay argumento)
    void loadSvgFile(const QString &path);

private slots:
    void onOpenFile();
    void onElementSelected(int index);
    void onPresetClicked();
    void onPlay();
    void onPause();
    void onReset();
    void onExport();
    void onTogglePiecesMode();
    void onUndo();
    void onRedo();
    void onCopy();
    void onPaste();
    void onDelete();
    void onDuplicate();
    void onHistoryChanged();

private:
    // Construccion de UI
    void setupMenuBar();
    QWidget *createLeftPanel();
    QWidget *createControlPanel();
    void loadElementConfig(int index);

    QTimer *m_historyTimer = nullptr;

    // Componentes principales
    SvgView       *m_svgView       = nullptr;
    ElementPanel  *m_elementPanel  = nullptr;

    // Panel izquierdo: presets
    QVector<QPushButton*> m_presetButtons;

    // Panel izquierdo: reproduccion
    QPushButton *m_playBtn   = nullptr;
    QPushButton *m_pauseBtn  = nullptr;
    QPushButton *m_resetBtn  = nullptr;

    // Panel izquierdo: historial
    QPushButton *m_undoBtn = nullptr;
    QPushButton *m_redoBtn = nullptr;

    // Panel izquierdo: acciones de elemento
    QPushButton *m_copyBtn       = nullptr;
    QPushButton *m_pasteBtn      = nullptr;
    QPushButton *m_deleteBtn     = nullptr;
    QPushButton *m_duplicateBtn  = nullptr;

    // Panel izquierdo: modo piezas
    QPushButton *m_piecesBtn = nullptr;

    // Panel izquierdo: controles de animacion
    QLabel      *m_selectedLabel  = nullptr;

    QSlider     *m_speedSlider    = nullptr;
    QLabel      *m_speedVal       = nullptr;

    QSlider     *m_delaySlider    = nullptr;
    QLabel      *m_delayVal       = nullptr;

    QPushButton *m_iterInfBtn     = nullptr;
    QPushButton *m_iter1Btn       = nullptr;
    QPushButton *m_iter3Btn       = nullptr;

    QPushButton *m_dirNormalBtn   = nullptr;
    QPushButton *m_dirReverseBtn  = nullptr;
    QPushButton *m_dirAlternateBtn = nullptr;

    // Angulo de direccion
    QWidget     *m_directionGroup  = nullptr;
    QSlider     *m_directionSlider = nullptr;
    QLabel      *m_directionVal    = nullptr;
    QVector<QPushButton*> m_dirPresetButtons;

    // Controles de ovalo
    QWidget     *m_ovalControls    = nullptr;
    QSlider     *m_ovalRxSlider    = nullptr;
    QLabel      *m_ovalRxVal       = nullptr;
    QSlider     *m_ovalRySlider    = nullptr;
    QLabel      *m_ovalRyVal       = nullptr;
    QSlider     *m_ovalAngleSlider = nullptr;
    QLabel      *m_ovalAngleVal    = nullptr;
};

#endif // MAINWINDOW_H
