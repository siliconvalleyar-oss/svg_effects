cmake_minimum_required(VERSION 3.16)
project(svg-animator LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)

# ---- Dependencias Qt ----
find_package(Qt5 REQUIRED COMPONENTS Widgets Svg Xml)

# ---- Sources ----
set(SOURCES
    src/main.cpp
    src/SvgView.cpp
    src/ElementPanel.cpp
    src/MainWindow.cpp
)

set(HEADERS
    src/SvgView.h
    src/ElementPanel.h
    src/MainWindow.h
    src/AnimPresets.h
)

# ---- Ejecutable ----
add_executable(${PROJECT_NAME} ${SOURCES} ${HEADERS})

target_link_libraries(${PROJECT_NAME} PRIVATE
    Qt5::Widgets
    Qt5::Svg
    Qt5::Xml
)

target_include_directories(${PROJECT_NAME} PRIVATE src)
