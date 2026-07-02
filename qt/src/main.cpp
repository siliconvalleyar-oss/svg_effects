/**
 *  @file  main.cpp
 *  @brief Punto de entrada del Animador SVG.
 *
 *  Aplicacion basada en Qt 5.15 con estilo oscuro Fusion.
 *  Carga la ventana principal (MainWindow) que contiene:
 *    - Visor SVG con animaciones por pieza
 *    - Panel de control con presets y parametros
 *    - Panel de piezas con seleccion individual
 *
 *  Uso: ./svg-animator [archivo.svg]
 */

#include <QApplication>
#include <QStyleFactory>

#include "MainWindow.h"

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);
    app.setApplicationName("SVG Animator");
    app.setApplicationVersion("1.1.0");

    // Tema Fusion (oscuro por defecto del sistema)
    app.setStyle(QStyleFactory::create("Fusion"));

    // Paleta oscura global
    QPalette darkPalette;
    darkPalette.setColor(QPalette::Window,          QColor("#1a1d27"));
    darkPalette.setColor(QPalette::WindowText,       Qt::white);
    darkPalette.setColor(QPalette::Base,             QColor("#242734"));
    darkPalette.setColor(QPalette::AlternateBase,    QColor("#1a1d27"));
    darkPalette.setColor(QPalette::ToolTipBase,      QColor("#2e3245"));
    darkPalette.setColor(QPalette::ToolTipText,      Qt::white);
    darkPalette.setColor(QPalette::Text,             QColor("#e4e6f0"));
    darkPalette.setColor(QPalette::Button,           QColor("#242734"));
    darkPalette.setColor(QPalette::ButtonText,       QColor("#e4e6f0"));
    darkPalette.setColor(QPalette::BrightText,       Qt::red);
    darkPalette.setColor(QPalette::Link,             QColor("#6c5ce7"));
    darkPalette.setColor(QPalette::Highlight,        QColor("#6c5ce7"));
    darkPalette.setColor(QPalette::HighlightedText,  Qt::black);
    app.setPalette(darkPalette);

    MainWindow window;
    window.setWindowTitle("SVG Animator");
    window.resize(1200, 750);

    // Cargar archivo si se pasa como argumento
    if (argc > 1) {
        window.loadSvgFile(argv[1]);
    }

    window.show();
    return app.exec();
}
