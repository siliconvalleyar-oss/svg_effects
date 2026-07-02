#ifndef ANIMPRESETS_H
#define ANIMPRESETS_H

#include <QString>
#include <QColor>
#include <QVector>

/// @brief  Define una plantilla de animacion (preset)
struct AnimPreset {
    QString id;               ///< Identificador interno (ej: "rotate")
    QString name;             ///< Nombre visible para el usuario
    QColor  color;            ///< Color de acento del preset
    double  defaultDuration;  ///< Duracion por defecto en segundos
    QString easing;           ///< Funcion de easing CSS (ej: "ease-in-out")
};

/// @brief  Retorna la lista completa de presets disponibles
inline const QVector<AnimPreset>& presets()
{
    static const QVector<AnimPreset> list = {
        {"rotate",    "Girar",        QColor("#6c5ce7"), 1.5, "linear"},
        {"pulse",     "Latir",        QColor("#e74c3c"), 0.8, "ease-in-out"},
        {"bounce",    "Rebotar",      QColor("#f39c12"), 1.0, "ease-in-out"},
        {"gravity",   "Gravedad",     QColor("#e74c3c"), 1.8, "ease-in"},
        {"slide",     "Deslizar",     QColor("#2ecc71"), 1.2, "ease-in-out"},
        {"shake",     "Agitar",       QColor("#f1c40f"), 0.6, "ease-in-out"},
        {"float",     "Flotar",       QColor("#3498db"), 2.0, "ease-in-out"},
        {"fade",      "Fundido",      QColor("#9b59b6"), 1.5, "ease-in-out"},
        {"spin",      "Torbellino",   QColor("#1abc9c"), 1.2, "ease-in-out"},
        {"wheel",     "Rueda",        QColor("#e67e22"), 1.0, "steps(4)"},
        {"oval",      "Ovalo",        QColor("#e74c3c"), 2.0, "linear"},
        {"glow",      "Brillar",      QColor("#6c5ce7"), 1.5, "ease-in-out"},
    };
    return list;
}

/// @brief  Busca un preset por su id
inline const AnimPreset* findPreset(const QString &id)
{
    for (const auto &p : presets())
        if (p.id == id) return &p;
    return nullptr;
}

#endif // ANIMPRESETS_H
