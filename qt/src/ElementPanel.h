#ifndef ELEMENTPANEL_H
#define ELEMENTPANEL_H

/**
 *  @file  ElementPanel.h
 *  @brief Panel lateral que lista las piezas del SVG con su preset asignado.
 *
 *  Muestra cada elemento como un boton con:
 *    - Miniatura SVG del elemento
 *    - Nombre / etiqueta
 *    - Nombre del preset asignado (con color indicador)
 *  Permite seleccionar un elemento haciendo clic en su boton.
 */

#include <QWidget>
#include <QVBoxLayout>
#include <QScrollArea>
#include <QLabel>
#include <QVector>

class QPushButton;
class SvgView;
struct SvgElement;

class ElementPanel : public QWidget
{
    Q_OBJECT

public:
    explicit ElementPanel(SvgView *svgView, QWidget *parent = nullptr);

    /// @brief  Refresca la lista de elementos desde SvgView
    void refresh();

private slots:
    void onElementSelected(int index);

private:
    SvgView              *m_svgView;
    QVBoxLayout          *m_layout;
    QScrollArea          *m_scroll;
    QWidget              *m_container;
    QVector<QPushButton*> m_buttons;
    QLabel               *m_emptyLabel;   ///< Mensaje cuando no hay elementos
};

#endif // ELEMENTPANEL_H
