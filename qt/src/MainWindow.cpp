/**
 *  @file  MainWindow.cpp
 *  @brief Implementacion de la ventana principal.
 *
 *  Construye los tres paneles (izquierdo, visor, derecho),
 *  conecta todas las senales y slots, y maneja la logica de
 *  reproduccion, presets, exportacion y modo piezas.
 */

#include "MainWindow.h"
#include "SvgView.h"
#include "ElementPanel.h"
#include "AnimPresets.h"

#include <QMenuBar>
#include <QFileDialog>
#include <QMessageBox>
#include <QSplitter>
#include <QPushButton>
#include <QSlider>
#include <QLabel>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QGridLayout>
#include <QGroupBox>
#include <QFileInfo>
#include <QDir>
#include <QApplication>
#include <QShortcut>
#include <QStyle>
#include <QTimer>

// ---------------------------------------------------------------------------
// Helpers de UI
// ---------------------------------------------------------------------------

/// @brief  Crea un boton con estilo "toggle" (checkeable)
static QPushButton *makeToggle(const QString &text, bool active = false)
{
    auto *btn = new QPushButton(text);
    btn->setCheckable(true);
    btn->setChecked(active);
    btn->setFixedHeight(28);
    btn->setStyleSheet(
        "QPushButton {"
        "  padding:4px 6px; border:1px solid #2e3245;"
        "  border-radius:6px; background:#242734;"
        "  color:#8b8fa7; font-size:10px;"
        "}"
        "QPushButton:hover { border-color:#6c5ce7; }"
        "QPushButton:checked {"
        "  border-color:#6c5ce7;"
        "  background:rgba(108,92,231,0.15);"
        "  color:#6c5ce7;"
        "}");
    return btn;
}

/// @brief  Crea un slider horizontal estilizado
static QSlider *makeSlider(double min, double max, double val, int = 0)
{
    auto *s = new QSlider(Qt::Horizontal);
    s->setRange(int(min * 10), int(max * 10));
    s->setValue(int(val * 10));
    s->setFixedHeight(20);
    s->setStyleSheet(
        "QSlider::groove:horizontal {"
        "  height:4px; background:#2e3245; border-radius:2px;"
        "}"
        "QSlider::handle:horizontal {"
        "  width:14px; height:14px; margin:-5px 0;"
        "  border-radius:7px; background:#6c5ce7;"
        "}");
    return s;
}

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
{
    // Tema oscuro global
    setStyleSheet(
        "QMainWindow { background:#0f1117; }"
        "QSplitter::handle { background:#2e3245; width:1px; }"
    );

    m_svgView      = new SvgView(this);
    m_elementPanel = new ElementPanel(m_svgView, this);

    m_historyTimer = new QTimer(this);
    m_historyTimer->setSingleShot(true);
    connect(m_historyTimer, &QTimer::timeout, this, [this]() {
        m_svgView->pushHistory();
    });

    setupMenuBar();

    auto *splitter = new QSplitter(Qt::Horizontal, this);
    splitter->setHandleWidth(1);
    splitter->addWidget(createLeftPanel());
    splitter->addWidget(m_svgView);
    splitter->addWidget(m_elementPanel);
    splitter->setStretchFactor(0, 0);
    splitter->setStretchFactor(1, 1);
    splitter->setStretchFactor(2, 0);
    splitter->setSizes({320, 600, 220});

    setCentralWidget(splitter);

    connect(m_svgView, &SvgView::elementSelected,
            this, &MainWindow::onElementSelected);
    connect(m_svgView, &SvgView::historyChanged,
            this, &MainWindow::onHistoryChanged);
    connect(m_svgView, &SvgView::elementsChanged, this, [this]() {
        bool hasElements = !m_svgView->elements().isEmpty();
        m_copyBtn->setEnabled(hasElements);
        m_deleteBtn->setEnabled(hasElements);
        m_duplicateBtn->setEnabled(hasElements);
    });

    // Atajos de teclado
    auto *undoShortcut = new QShortcut(QKeySequence::Undo,  this);
    connect(undoShortcut, &QShortcut::activated, this, &MainWindow::onUndo);

    auto *redoShortcut = new QShortcut(QKeySequence("Ctrl+Shift+Z"), this);
    connect(redoShortcut, &QShortcut::activated, this, &MainWindow::onRedo);

    auto *deleteShortcut = new QShortcut(QKeySequence::Delete, this);
    connect(deleteShortcut, &QShortcut::activated, this, &MainWindow::onDelete);

    auto *backspaceShortcut = new QShortcut(QKeySequence::Backspace, this);
    connect(backspaceShortcut, &QShortcut::activated, this, &MainWindow::onDelete);

    auto *copyShortcut = new QShortcut(QKeySequence::Copy, this);
    connect(copyShortcut, &QShortcut::activated, this, &MainWindow::onCopy);

    auto *pasteShortcut = new QShortcut(QKeySequence::Paste, this);
    connect(pasteShortcut, &QShortcut::activated, this, &MainWindow::onPaste);

    auto *dupShortcut = new QShortcut(QKeySequence("Ctrl+D"), this);
    connect(dupShortcut, &QShortcut::activated, this, &MainWindow::onDuplicate);
}

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------

void MainWindow::setupMenuBar()
{
    auto *fileMenu = menuBar()->addMenu(
        QString::fromUtf8("&Archivo"));

    auto *openAction = fileMenu->addAction(
        QString::fromUtf8("&Abrir SVG..."));
    openAction->setShortcut(QKeySequence::Open);
    connect(openAction, &QAction::triggered,
            this, &MainWindow::onOpenFile);

    auto *exportAction = fileMenu->addAction(
        QString::fromUtf8("&Exportar SVG Animado..."));
    exportAction->setShortcut(QKeySequence("Ctrl+E"));
    connect(exportAction, &QAction::triggered,
            this, &MainWindow::onExport);
}

// ---------------------------------------------------------------------------
// Panel izquierdo
// ---------------------------------------------------------------------------

QWidget *MainWindow::createLeftPanel()
{
    auto *panel = new QWidget();
    panel->setFixedWidth(320);

    auto *layout = new QVBoxLayout(panel);
    layout->setContentsMargins(0, 0, 0, 0);
    layout->setSpacing(0);

    // Area de scroll para que quepa todo
    auto *scroll = new QScrollArea();
    scroll->setWidgetResizable(true);
    scroll->setFrameShape(QFrame::NoFrame);
    scroll->setStyleSheet(
        "QScrollArea { background:#1a1d27; }"
        "QScrollBar:vertical { width:4px; background:#1a1d27; }"
        "QScrollBar::handle:vertical {"
        "  background:#2e3245; border-radius:2px; min-height:20px; }"
        "QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {"
        "  height:0; }"
    );

    auto *container = new QWidget();
    container->setStyleSheet("background:#1a1d27;");
    auto *cl = new QVBoxLayout(container);
    cl->setContentsMargins(14, 12, 14, 12);
    cl->setSpacing(0);

    // Helper: seccion con titulo
    auto addSection = [&](const QString &title, QWidget *content) {
        auto *label = new QLabel(title);
        label->setStyleSheet(
            "font-size:9px;text-transform:uppercase;"
            "letter-spacing:1.5px;color:#8b8fa7;"
            "font-weight:600;padding:12px 0 8px 0;");
        cl->addWidget(label);
        cl->addWidget(content);
    };

    // ---- Importar SVG ----
    auto *openBtn = new QPushButton(
        QString::fromUtf8("Abrir SVG..."));
    openBtn->setStyleSheet(
        "QPushButton {"
        "  padding:10px; border:2px dashed #2e3245;"
        "  border-radius:8px; background:#242734;"
        "  color:#e4e6f0; font-size:12px;"
        "}"
        "QPushButton:hover { border-color:#6c5ce7; }");
    connect(openBtn, &QPushButton::clicked,
            this, &MainWindow::onOpenFile);
    addSection(QString::fromUtf8("Importar"), openBtn);

    // ---- Presets ----
    auto *presetGrid = new QWidget();
    auto *pg = new QGridLayout(presetGrid);
    pg->setContentsMargins(0, 0, 0, 0);
    pg->setSpacing(6);

    const auto &allPresets = presets();
    int row = 0, col = 0;
    for (const auto &p : allPresets) {
        auto *btn = new QPushButton(p.name);
        btn->setProperty("presetId", p.id);
        btn->setCheckable(true);
        btn->setFixedHeight(32);
        btn->setStyleSheet(
            QString(
                "QPushButton {"
                "  padding:6px 8px; border:1px solid #2e3245;"
                "  border-radius:6px; background:#242734;"
                "  color:#e4e6f0; font-size:11px; text-align:left;"
                "}"
                "QPushButton:hover { border-color:%1; }"
                "QPushButton:checked {"
                "  border-color:%1;"
                "  background:rgba(108,92,231,0.15);"
                "  color:%1;"
                "}")
            .arg(p.color.name()));
        connect(btn, &QPushButton::clicked,
                this, &MainWindow::onPresetClicked);
        pg->addWidget(btn, row, col);
        m_presetButtons.append(btn);
        ++col;
        if (col > 1) { col = 0; ++row; }
    }
    addSection(QString::fromUtf8("Animaciones"), presetGrid);

    // ---- Playback ----
    auto *playbackRow = new QWidget();
    auto *pb = new QHBoxLayout(playbackRow);
    pb->setContentsMargins(0, 8, 0, 0);
    pb->setSpacing(6);

    m_playBtn  = new QPushButton(QString::fromUtf8("\u25B6"));
    m_pauseBtn = new QPushButton(QString::fromUtf8("\u23F8"));
    m_resetBtn = new QPushButton(QString::fromUtf8("\u23EE"));

    QString pbStyle =
        "QPushButton {"
        "  padding:10px; border:1px solid #2e3245;"
        "  border-radius:8px; background:#242734;"
        "  color:#e4e6f0; font-size:16px;"
        "}"
        "QPushButton:hover { border-color:#6c5ce7; }";

    for (auto *b : {m_playBtn, m_pauseBtn, m_resetBtn}) {
        b->setStyleSheet(pbStyle);
        b->setFixedHeight(40);
        pb->addWidget(b);
    }
    connect(m_playBtn,  &QPushButton::clicked, this, &MainWindow::onPlay);
    connect(m_pauseBtn, &QPushButton::clicked, this, &MainWindow::onPause);
    connect(m_resetBtn, &QPushButton::clicked, this, &MainWindow::onReset);
    cl->addWidget(playbackRow);

    // ---- Undo / Redo ----
    auto *histRow = new QWidget();
    auto *hr = new QHBoxLayout(histRow);
    hr->setContentsMargins(0, 8, 0, 0);
    hr->setSpacing(6);

    m_undoBtn = new QPushButton(QString::fromUtf8("\u21A9"));
    m_redoBtn = new QPushButton(QString::fromUtf8("\u21AA"));
    QString histStyle =
        "QPushButton {"
        "  width:40px; height:32px;"
        "  border:1px solid #2e3245; border-radius:6px;"
        "  background:rgba(36,39,52,0.8);"
        "  color:#e4e6f0; font-size:16px;"
        "}"
        "QPushButton:hover { border-color:#6c5ce7;"
        "  background:rgba(108,92,231,0.2); }"
        "QPushButton:disabled {"
        "  color:#4a4d5e; border-color:#2a2d3a;"
        "  background:rgba(36,39,52,0.4); }";
    for (auto *b : {m_undoBtn, m_redoBtn}) {
        b->setStyleSheet(histStyle);
        b->setFixedSize(40, 32);
        b->setEnabled(false);
        hr->addWidget(b);
    }
    connect(m_undoBtn, &QPushButton::clicked, this, &MainWindow::onUndo);
    connect(m_redoBtn, &QPushButton::clicked, this, &MainWindow::onRedo);
    cl->addWidget(histRow);

    // ---- Acciones de elemento (copiar/pegar/eliminar/duplicar) ----
    auto *elActionRow = new QWidget();
    auto *ear = new QHBoxLayout(elActionRow);
    ear->setContentsMargins(0, 0, 0, 0);
    ear->setSpacing(4);

    m_copyBtn      = new QPushButton(QString::fromUtf8("Copiar"));
    m_pasteBtn     = new QPushButton(QString::fromUtf8("Pegar"));
    m_deleteBtn    = new QPushButton(QString::fromUtf8("Eliminar"));
    m_duplicateBtn = new QPushButton(QString::fromUtf8("Duplicar"));

    QString elBtnStyle =
        "QPushButton {"
        "  padding:6px 8px; border:1px solid #2e3245;"
        "  border-radius:6px; background:#242734;"
        "  color:#e4e6f0; font-size:10px;"
        "}"
        "QPushButton:hover { border-color:#6c5ce7; }"
        "QPushButton:disabled { color:#4a4d5e; border-color:#1e2130; }";
    for (auto *b : {m_copyBtn, m_pasteBtn, m_deleteBtn, m_duplicateBtn}) {
        b->setStyleSheet(elBtnStyle);
        b->setFixedHeight(28);
        b->setEnabled(false);
        ear->addWidget(b);
    }
    connect(m_copyBtn,      &QPushButton::clicked, this, &MainWindow::onCopy);
    connect(m_pasteBtn,     &QPushButton::clicked, this, &MainWindow::onPaste);
    connect(m_deleteBtn,    &QPushButton::clicked, this, &MainWindow::onDelete);
    connect(m_duplicateBtn, &QPushButton::clicked, this, &MainWindow::onDuplicate);
    cl->addWidget(elActionRow);

    // ---- Controles de animacion ----
    cl->addWidget(createControlPanel());

    // ---- Modo piezas ----
    m_piecesBtn = new QPushButton(
        QString::fromUtf8("Mover piezas por separado"));
    m_piecesBtn->setStyleSheet(
        "QPushButton {"
        "  width:100%; padding:10px; border:1px solid #2e3245;"
        "  border-radius:8px; background:#242734;"
        "  color:#e4e6f0; font-size:11px; margin-top:12px;"
        "}"
        "QPushButton:hover { border-color:#6c5ce7; }"
        "QPushButton:checked {"
        "  border-color:#6c5ce7;"
        "  background:rgba(108,92,231,0.15);"
        "}");
    m_piecesBtn->setCheckable(true);
    connect(m_piecesBtn, &QPushButton::clicked,
            this, &MainWindow::onTogglePiecesMode);
    cl->addWidget(m_piecesBtn);

    // ---- Exportar ----
    auto *exportBtn = new QPushButton(
        QString::fromUtf8("Exportar SVG Animado"));
    exportBtn->setStyleSheet(
        "QPushButton {"
        "  width:100%; padding:10px; border:none; border-radius:8px;"
        "  background:#6c5ce7; color:white; font-size:12px;"
        "  font-weight:600; margin-top:12px;"
        "}"
        "QPushButton:hover { background:#7c6ef7; }");
    connect(exportBtn, &QPushButton::clicked,
            this, &MainWindow::onExport);
    cl->addWidget(exportBtn);

    cl->addStretch();

    scroll->setWidget(container);
    layout->addWidget(scroll);
    return panel;
}

// ---------------------------------------------------------------------------
// Panel de controles de animacion (velocidad, retraso, direccion, ovalo)
// ---------------------------------------------------------------------------

QWidget *MainWindow::createControlPanel()
{
    auto *group = new QWidget();
    auto *layout = new QVBoxLayout(group);
    layout->setContentsMargins(0, 0, 0, 0);
    layout->setSpacing(10);

    // Elemento seleccionado
    m_selectedLabel = new QLabel(
        QString::fromUtf8("Selecciona un elemento"));
    m_selectedLabel->setStyleSheet(
        "color:#8b8fa7;font-size:10px;padding:4px 0;");
    layout->addWidget(m_selectedLabel);

    // Helper: fila con slider + etiqueta
    auto makeSliderRow = [&](const QString &labelText,
                             QSlider *&slider, QLabel *&valLabel)
    {
        auto *row = new QWidget();
        auto *hl = new QHBoxLayout(row);
        hl->setContentsMargins(0, 0, 0, 0);
        auto *lbl = new QLabel(labelText);
        lbl->setStyleSheet(
            "color:#8b8fa7;font-size:11px;min-width:60px;");
        slider  = makeSlider(0, 100, 50);
        valLabel = new QLabel("—");
        valLabel->setStyleSheet(
            "color:#e4e6f0;font-size:11px;font-weight:600;min-width:36px;");
        hl->addWidget(lbl);
        hl->addWidget(slider);
        hl->addWidget(valLabel);
        layout->addWidget(row);
    };

    // Velocidad
    makeSliderRow(QString::fromUtf8("Velocidad"),
                  m_speedSlider, m_speedVal);
    m_speedSlider->setRange(2, 50);   // 0.2 - 5.0
    m_speedSlider->setValue(10);       // 1.0
    auto setupSliderWithHistory = [this](QSlider *slider, auto setter) {
        connect(slider, &QSlider::valueChanged, this, [this, slider, setter](int v) {
            int idx = m_svgView->selectedIndex();
            if (idx < 0) return;
            setter(idx, v);
            m_svgView->applyAnimation(idx);
            // Debounce: push history 400ms after last change
            if (m_historyTimer) m_historyTimer->stop();
            m_historyTimer->start(400);
        });
    };

    setupSliderWithHistory(m_speedSlider, [this](int idx, int v) {
        double val = v / 10.0;
        m_svgView->elements()[idx]->anim.speed = val;
        m_speedVal->setText(QString::number(val, 'f', 1) + "s");
    });

    // Retraso
    makeSliderRow(QString::fromUtf8("Retraso"),
                  m_delaySlider, m_delayVal);
    m_delaySlider->setRange(0, 30);
    m_delaySlider->setValue(0);
    setupSliderWithHistory(m_delaySlider, [this](int idx, int v) {
        double val = v / 10.0;
        m_svgView->elements()[idx]->anim.delay = val;
        m_delayVal->setText(QString::number(val, 'f', 1) + "s");
    });

    // ---- Repeticion ----
    auto *iterRow = new QWidget();
    auto *ir = new QHBoxLayout(iterRow);
    ir->setContentsMargins(0, 0, 0, 0);
    auto *iterLabel = new QLabel(QString::fromUtf8("Repetir"));
    iterLabel->setStyleSheet(
        "color:#8b8fa7;font-size:11px;min-width:60px;");
    m_iterInfBtn = makeToggle(QString::fromUtf8("Infinito"), true);
    m_iter1Btn   = makeToggle(QString::fromUtf8("1 vez"));
    m_iter3Btn   = makeToggle(QString::fromUtf8("3 veces"));
    ir->addWidget(iterLabel);
    ir->addWidget(m_iterInfBtn);
    ir->addWidget(m_iter1Btn);
    ir->addWidget(m_iter3Btn);
    layout->addWidget(iterRow);

    auto connectIter = [this](QPushButton *btn, int count) {
        connect(btn, &QPushButton::clicked, this, [this, btn, count]() {
            for (auto *b : {m_iterInfBtn, m_iter1Btn, m_iter3Btn})
                b->setChecked(false);
            btn->setChecked(true);
            int idx = m_svgView->selectedIndex();
            if (idx < 0) return;
            m_svgView->pushHistory();
            m_svgView->elements()[idx]->anim.repeatCount = count;
            m_svgView->applyAnimation(idx);
        });
    };
    connectIter(m_iterInfBtn, -1);
    connectIter(m_iter1Btn,   1);
    connectIter(m_iter3Btn,   3);

    // ---- Direccion (normal/reverse/alternate) ----
    auto *dirRow = new QWidget();
    auto *dirR = new QHBoxLayout(dirRow);
    dirR->setContentsMargins(0, 0, 0, 0);
    auto *dirLabel = new QLabel(QString::fromUtf8("Direccion"));
    dirLabel->setStyleSheet(
        "color:#8b8fa7;font-size:11px;min-width:60px;");
    m_dirNormalBtn   = makeToggle(QString::fromUtf8("Normal"), true);
    m_dirReverseBtn  = makeToggle(QString::fromUtf8("Reversa"));
    m_dirAlternateBtn = makeToggle(QString::fromUtf8("Alterno"));
    dirR->addWidget(dirLabel);
    dirR->addWidget(m_dirNormalBtn);
    dirR->addWidget(m_dirReverseBtn);
    dirR->addWidget(m_dirAlternateBtn);
    layout->addWidget(dirRow);

    auto connectDir = [this](QPushButton *btn, const QString &dir) {
        connect(btn, &QPushButton::clicked, this, [this, btn, dir]() {
            for (auto *b : {m_dirNormalBtn, m_dirReverseBtn, m_dirAlternateBtn})
                b->setChecked(false);
            btn->setChecked(true);
            int idx = m_svgView->selectedIndex();
            if (idx < 0) return;
            m_svgView->pushHistory();
            m_svgView->elements()[idx]->anim.direction = dir;
            m_svgView->applyAnimation(idx);
        });
    };
    connectDir(m_dirNormalBtn,   "normal");
    connectDir(m_dirReverseBtn,  "reverse");
    connectDir(m_dirAlternateBtn,"alternate");

    // ---- Angulo de direccion ----
    m_directionGroup = new QWidget();
    auto *dg = new QVBoxLayout(m_directionGroup);
    dg->setContentsMargins(0, 0, 0, 0);
    dg->setSpacing(6);

    auto *angleRow = new QWidget();
    auto *ar = new QHBoxLayout(angleRow);
    ar->setContentsMargins(0, 0, 0, 0);
    auto *angleLabel = new QLabel(QString::fromUtf8("Angulo"));
    angleLabel->setStyleSheet(
        "color:#8b8fa7;font-size:11px;min-width:60px;");
    m_directionSlider = makeSlider(0, 360, 0);
    m_directionVal    = new QLabel("0\u00B0");
    m_directionVal->setStyleSheet(
        "color:#e4e6f0;font-size:11px;font-weight:600;min-width:36px;");
    ar->addWidget(angleLabel);
    ar->addWidget(m_directionSlider);
    ar->addWidget(m_directionVal);
    dg->addWidget(angleRow);

    // Botones rapidos de direccion
    auto *dirPresetGrid = new QWidget();
    auto *dpg = new QGridLayout(dirPresetGrid);
    dpg->setContentsMargins(0, 0, 0, 0);
    dpg->setSpacing(4);

    struct DirP { QString label; int angle; };
    QVector<DirP> dirs = {
        {"\u2192",0}, {"\u2197",45},  {"\u2191",90},  {"\u2196",135},
        {"\u2190",180},{"\u2199",225},{"\u2193",270},{"\u2198",315}
    };
    int drRow = 0, drCol = 0;
    for (const auto &d : dirs) {
        auto *btn = new QPushButton(d.label);
        btn->setProperty("angle", d.angle);
        btn->setFixedSize(32, 32);
        btn->setStyleSheet(
            "QPushButton {"
            "  border:1px solid #2e3245; border-radius:6px;"
            "  background:#242734; color:#e4e6f0; font-size:13px;"
            "}"
            "QPushButton:hover { border-color:#6c5ce7; }");
        connect(btn, &QPushButton::clicked, this, [this, d]() {
            int idx = m_svgView->selectedIndex();
            if (idx < 0) return;
            auto *el = m_svgView->elements()[idx];
            m_svgView->pushHistory();
            el->anim.directionAngle = d.angle;
            m_directionSlider->setValue(int(d.angle * 10));
            m_directionVal->setText(
                QString::number(d.angle) + QString::fromUtf8("\u00B0"));
            m_svgView->applyAnimation(idx);
        });
        dpg->addWidget(btn, drRow, drCol);
        m_dirPresetButtons.append(btn);
        ++drCol;
        if (drCol > 3) { drCol = 0; ++drRow; }
    }
    dg->addWidget(dirPresetGrid);
    m_directionGroup->setVisible(false);
    layout->addWidget(m_directionGroup);

    // ---- Controles de ovalo ----
    m_ovalControls = new QWidget();
    auto *oc = new QVBoxLayout(m_ovalControls);
    oc->setContentsMargins(0, 0, 0, 0);
    oc->setSpacing(8);

    auto *ovalTitle = new QLabel(QString::fromUtf8("Ovulo"));
    ovalTitle->setStyleSheet(
        "font-size:9px;text-transform:uppercase;letter-spacing:1.5px;"
        "color:#8b8fa7;font-weight:600;");

    auto makeOvalRow = [&](const QString &label,
                           QSlider *&slider, QLabel *&valLabel)
    {
        auto *row = new QWidget();
        auto *rl = new QHBoxLayout(row);
        rl->setContentsMargins(0, 0, 0, 0);
        auto *lbl = new QLabel(label);
        lbl->setStyleSheet(
            "color:#8b8fa7;font-size:11px;min-width:60px;");
        slider   = makeSlider(10, 150, 80);
        valLabel = new QLabel("80px");
        valLabel->setStyleSheet(
            "color:#e4e6f0;font-size:11px;font-weight:600;min-width:36px;");
        rl->addWidget(lbl);
        rl->addWidget(slider);
        rl->addWidget(valLabel);
        oc->addWidget(row);
    };

    oc->addWidget(ovalTitle);
    makeOvalRow(QString::fromUtf8("Ancho X"), m_ovalRxSlider, m_ovalRxVal);
    makeOvalRow(QString::fromUtf8("Alto Y"),  m_ovalRySlider, m_ovalRyVal);

    m_ovalAngleSlider = makeSlider(0, 360, 0);
    m_ovalAngleVal    = new QLabel("0\u00B0");
    m_ovalAngleVal->setStyleSheet(
        "color:#e4e6f0;font-size:11px;font-weight:600;min-width:36px;");

    auto *oaRow = new QWidget();
    auto *oaRl = new QHBoxLayout(oaRow);
    oaRl->setContentsMargins(0, 0, 0, 0);
    auto *oaLabel = new QLabel(QString::fromUtf8("Angulo"));
    oaLabel->setStyleSheet(
        "color:#8b8fa7;font-size:11px;min-width:60px;");
    oaRl->addWidget(oaLabel);
    oaRl->addWidget(m_ovalAngleSlider);
    oaRl->addWidget(m_ovalAngleVal);
    oc->addWidget(oaRow);

    auto setupOvalSlider = [this](QSlider *slider, auto setter) {
        connect(slider, &QSlider::valueChanged, this, [this, slider, setter](int v) {
            int idx = m_svgView->selectedIndex();
            if (idx < 0) return;
            setter(idx, v);
            m_svgView->applyAnimation(idx);
            if (m_historyTimer) m_historyTimer->stop();
            m_historyTimer->start(400);
        });
    };

    setupOvalSlider(m_ovalRxSlider, [this](int idx, int v) {
        m_svgView->elements()[idx]->anim.ovalRx = v;
        m_ovalRxVal->setText(QString::number(v) + "px");
    });
    setupOvalSlider(m_ovalRySlider, [this](int idx, int v) {
        m_svgView->elements()[idx]->anim.ovalRy = v;
        m_ovalRyVal->setText(QString::number(v) + "px");
    });
    setupOvalSlider(m_ovalAngleSlider, [this](int idx, int v) {
        m_svgView->elements()[idx]->anim.ovalAngle = v;
        m_ovalAngleVal->setText(
            QString::number(v) + QString::fromUtf8("\u00B0"));
        m_svgView->applyAnimation(idx);
    });

    m_ovalControls->setVisible(false);
    layout->addWidget(m_ovalControls);

    return group;
}

// ===========================================================================
// SLOTS
// ===========================================================================

void MainWindow::loadSvgFile(const QString &path)
{
    if (m_svgView) m_svgView->loadSvg(path);
}

void MainWindow::onOpenFile()
{
    QString path = QFileDialog::getOpenFileName(
        this, QString::fromUtf8("Abrir SVG"),
        QString(), "SVG Files (*.svg)");
    if (!path.isEmpty())
        m_svgView->loadSvg(path);
}

void MainWindow::onElementSelected(int index)
{
    if (index < 0 || index >= m_svgView->elements().size()) {
        m_selectedLabel->setText(
            QString::fromUtf8("Selecciona un elemento"));
        m_copyBtn->setEnabled(false);
        m_deleteBtn->setEnabled(false);
        m_duplicateBtn->setEnabled(false);
        return;
    }
    loadElementConfig(index);
    m_copyBtn->setEnabled(true);
    m_deleteBtn->setEnabled(true);
    m_duplicateBtn->setEnabled(true);
}

/// @brief  Carga la configuracion del elemento @p index en los controles
void MainWindow::loadElementConfig(int index)
{
    if (index < 0 || index >= m_svgView->elements().size()) return;
    auto *el = m_svgView->elements()[index];
    if (!el) return;

    QString name = el->id.isEmpty()
        ? QString("%1 %2").arg(el->tagName).arg(index + 1)
        : el->id;
    m_selectedLabel->setText(
        QString::fromUtf8("Editando: ") + name);

    // Presets (multi-seleccion)
    for (auto *btn : m_presetButtons)
        btn->setChecked(
            el->anim.presetIds.contains(btn->property("presetId").toString()));

    // Sliders
    m_speedSlider->setValue(int(el->anim.speed * 10));
    m_speedVal->setText(QString::number(el->anim.speed, 'f', 1) + "s");
    m_delaySlider->setValue(int(el->anim.delay * 10));
    m_delayVal->setText(QString::number(el->anim.delay, 'f', 1) + "s");

    // Repeticion
    for (auto *b : {m_iterInfBtn, m_iter1Btn, m_iter3Btn})
        b->setChecked(false);
    if (el->anim.repeatCount < 0)      m_iterInfBtn->setChecked(true);
    else if (el->anim.repeatCount == 1) m_iter1Btn->setChecked(true);
    else if (el->anim.repeatCount == 3) m_iter3Btn->setChecked(true);

    // Direccion
    for (auto *b : {m_dirNormalBtn, m_dirReverseBtn, m_dirAlternateBtn})
        b->setChecked(false);
    if (el->anim.direction == "normal")      m_dirNormalBtn->setChecked(true);
    else if (el->anim.direction == "reverse") m_dirReverseBtn->setChecked(true);
    else m_dirAlternateBtn->setChecked(true);

    // Angulo de direccion
    m_directionSlider->setValue(int(el->anim.directionAngle * 10));
    m_directionVal->setText(
        QString::number(int(el->anim.directionAngle))
        + QString::fromUtf8("\u00B0"));

    bool hasPresets = !el->anim.presetIds.isEmpty();
    m_directionGroup->setVisible(hasPresets);
    m_ovalControls->setVisible(el->anim.presetIds.contains("oval"));

    if (el->anim.presetIds.contains("oval")) {
        m_ovalRxSlider->setValue(el->anim.ovalRx);
        m_ovalRxVal->setText(QString::number(el->anim.ovalRx) + "px");
        m_ovalRySlider->setValue(el->anim.ovalRy);
        m_ovalRyVal->setText(QString::number(el->anim.ovalRy) + "px");
        m_ovalAngleSlider->setValue(int(el->anim.ovalAngle));
        m_ovalAngleVal->setText(
            QString::number(int(el->anim.ovalAngle))
            + QString::fromUtf8("\u00B0"));
    }
}

void MainWindow::onPresetClicked()
{
    auto *btn = qobject_cast<QPushButton*>(sender());
    if (!btn) return;
    QString id = btn->property("presetId").toString();

    int idx = m_svgView->selectedIndex();
    if (idx < 0) {
        if (!m_svgView->elements().isEmpty()) {
            idx = 0;
            m_svgView->selectElement(0);
        } else {
            return;
        }
    }

    auto *el = m_svgView->elements()[idx];
    // Toggle: si ya esta activo lo quitamos, si no lo agregamos
    if (el->anim.presetIds.contains(id)) {
        el->anim.presetIds.removeAll(id);
    } else {
        el->anim.presetIds.append(id);
    }

    m_svgView->pushHistory();
    m_svgView->applyAnimation(idx);
    loadElementConfig(idx);
    m_elementPanel->refresh();
}

void MainWindow::onPlay()
{
    m_svgView->playAll();
    m_playBtn->setChecked(true);
    m_pauseBtn->setChecked(false);
}

void MainWindow::onPause()
{
    m_svgView->pauseAll();
    m_pauseBtn->setChecked(true);
    m_playBtn->setChecked(false);
}

void MainWindow::onReset()
{
    m_svgView->resetAll();
    m_playBtn->setChecked(false);
    m_pauseBtn->setChecked(false);
}

void MainWindow::onExport()
{
    if (m_svgView->elements().isEmpty()) {
        QMessageBox::information(
            this, QString::fromUtf8("Exportar"),
            QString::fromUtf8("Carga un SVG primero."));
        return;
    }

    QString path = QFileDialog::getSaveFileName(
        this, QString::fromUtf8("Guardar SVG Animado"),
        "animated.svg", "SVG Files (*.svg)");
    if (path.isEmpty()) return;

    QString svgContent = m_svgView->exportAnimatedSvg();
    QFile file(path);
    if (file.open(QIODevice::WriteOnly)) {
        file.write(svgContent.toUtf8());
        file.close();
        QMessageBox::information(
            this, QString::fromUtf8("Exportar"),
            QString::fromUtf8(
                "SVG animado guardado correctamente."));
    }
}

void MainWindow::onTogglePiecesMode()
{
    bool on = m_piecesBtn->isChecked();
    m_svgView->setPiecesMode(on);
    m_piecesBtn->setText(on
        ? QString::fromUtf8("Salir del modo piezas")
        : QString::fromUtf8("Mover piezas por separado"));
}

// ======================================================================
// Historial (Undo / Redo)
// ======================================================================

void MainWindow::onUndo()
{
    m_svgView->undo();
}

void MainWindow::onRedo()
{
    m_svgView->redo();
}

void MainWindow::onHistoryChanged()
{
    m_undoBtn->setEnabled(m_svgView->canUndo());
    m_redoBtn->setEnabled(m_svgView->canRedo());
}

// ======================================================================
// Acciones de elemento
// ======================================================================

void MainWindow::onCopy()
{
    m_svgView->copyElementConfig();
    m_pasteBtn->setEnabled(m_svgView->hasCopiedConfig());
}

void MainWindow::onPaste()
{
    m_svgView->pasteElementConfig();
}

void MainWindow::onDelete()
{
    m_svgView->deleteElement();
    m_pasteBtn->setEnabled(false);
}

void MainWindow::onDuplicate()
{
    m_svgView->duplicateElement();
}
