# Reglas del proyecto

## Versionado

- El archivo `VERSION` contiene la versión actual del proyecto (semver).
- Cada `git push` debe ir precedido por un tag con el mismo contenido que `VERSION`.
- El tag debe crearse con: `git tag $(cat VERSION)`
- Verificar antes de pushear que el tag no exista ya en el remoto.

## Checklist antes de pushear

1. `VERSION` está actualizado con el número correcto.
2. El tag local coincide con `VERSION`: `git tag | grep "$(cat VERSION)"`
3. Los cambios están commitados y el working tree está limpio (`git status`).
4. El tag se ha creado: `git tag $(cat VERSION)`
5. Push: `git push origin main --tags`
