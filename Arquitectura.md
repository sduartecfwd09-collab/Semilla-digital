# Proyecto AgroMap

## Directorio del Proyecto

```text
AgroMap/
├── Semilla-digital/
│   ├── .gitignore
│   ├── ERD_Diagrama_AGROMAP.png
│   ├── README.md
│   ├── BackEnd/
│   │   ├── .env
│   │   ├── .gitignore
│   │   ├── .sequelizerc
│   │   ├── agent.md
│   │   ├── check_db.js
│   │   ├── check_products.js
│   │   ├── copia_respaldo.sql
│   │   ├── package.json
│   │   ├── Config/
│   │   │   ├── config.js
│   │   ├── Migrations/
│   │   │   ├── 000-create-roles.js
│   │   │   ├── 001-create-provincias.js
│   │   │   ├── 002-create-cantones.js
│   │   │   ├── 003-create-distritos.js
│   │   │   ├── 004-create-direcciones.js
│   │   │   ├── 005-create-ferias.js
│   │   │   ├── 006-create-usuarios.js
│   │   │   ├── 007-create-productos.js
│   │   │   ├── 008-create-recetas.js
│   │   │   ├── 009-create-solicitudes-cambio-rol.js
│   │   │   ├── 010-create-puestos-productor.js
│   │   │   ├── 011-create-puesto-ferias.js
│   │   │   ├── 012-create-oferta-productos.js
│   │   │   ├── 013-create-receta-ingredientes.js
│   │   │   ├── 014-create-mensajes-contacto.js
│   │   │   ├── 015-create-proformas.js
│   │   │   ├── 016-create-modulos.js
│   │   │   ├── 017-create-permisos.js
│   │   │   ├── 018-create-role-permiso.js
│   │   │   ├── 019-create-audit-logs.js
│   │   │   ├── 020-create-delivery-module.js
│   │   │   ├── 021-insert-delivery-role.js
│   │   │   ├── 022-add-selfie-solicitud.js
│   │   │   ├── 023-add-delivery-earnings-columns.js
│   │   │   ├── 024-add-datos-extendidos-puesto-productor.js
│   │   │   ├── 025-update-delivery-model-uber-eats.js
│   │   │   ├── 027-migrate-legacy-roles-in-requests.js
│   │   │   ├── 028-add-columns-to-delivery-drivers.js
│   │   │   ├── 028-add-image-to-recetas.js
│   │   │   ├── 028-add-image-url-to-recetas.js
│   │   │   ├── 029-add-brand-model-to-delivery-and-solicitudes.js
│   │   │   ├── 029-create-proforma-items.js
│   │   │   ├── 030-add-explicit-delivery-columns-to-drivers.js
│   │   │   ├── 030-create-producer-earnings.js
│   │   │   ├── 031-create-platform-settings.js
│   │   │   ├── 032-add-delivery-permissions.js
│   │   │   ├── 033-drop-orphan-delivery-application-tables.js
│   │   ├── mock-documents/
│   │   │   ├── carnet_mag_QA-2026-001.pdf
│   │   │   ├── carnet_mag_QA-2026-002.pdf
│   │   │   ├── carnet_mag_QA-2026-003.pdf
│   │   │   ├── carnet_mag_QA-2026-004.pdf
│   │   │   ├── carnet_mag_QA-2026-006.pdf
│   │   │   ├── carnet_mag_QA-2026-007.pdf
│   │   │   ├── carnet_mag_QA-2026-008.pdf
│   │   │   ├── carnet_mag_QA-2026-010.pdf
│   │   │   ├── carnet_mag_QA-2026-011.pdf
│   │   │   ├── carnet_mag_QA-2026-012.pdf
│   │   │   ├── carnet_mag_QA-2026-013.pdf
│   │   │   ├── carnet_mag_QA-2026-014.pdf
│   │   │   ├── carnet_mag_QA-2026-015.pdf
│   │   │   ├── certificacion_QA-2026-001.pdf
│   │   │   ├── certificacion_QA-2026-002.pdf
│   │   │   ├── certificacion_QA-2026-003.pdf
│   │   │   ├── certificacion_QA-2026-004.pdf
│   │   │   ├── certificacion_QA-2026-005.pdf
│   │   │   ├── certificacion_QA-2026-006.pdf
│   │   │   ├── certificacion_QA-2026-007.pdf
│   │   │   ├── certificacion_QA-2026-008.pdf
│   │   │   ├── certificacion_QA-2026-009.pdf
│   │   │   ├── certificacion_QA-2026-010.pdf
│   │   │   ├── certificacion_QA-2026-011.pdf
│   │   │   ├── certificacion_QA-2026-012.pdf
│   │   │   ├── certificacion_QA-2026-013.pdf
│   │   │   ├── certificacion_QA-2026-014.pdf
│   │   │   ├── certificacion_QA-2026-015.pdf
│   │   │   ├── identificacion_QA-2026-001.pdf
│   │   │   ├── identificacion_QA-2026-002.pdf
│   │   │   ├── identificacion_QA-2026-003.pdf
│   │   │   ├── identificacion_QA-2026-004.pdf
│   │   │   ├── identificacion_QA-2026-005.pdf
│   │   │   ├── identificacion_QA-2026-006.pdf
│   │   │   ├── identificacion_QA-2026-007.pdf
│   │   │   ├── identificacion_QA-2026-008.pdf
│   │   │   ├── identificacion_QA-2026-009.pdf
│   │   │   ├── identificacion_QA-2026-010.pdf
│   │   │   ├── identificacion_QA-2026-011.pdf
│   │   │   ├── identificacion_QA-2026-012.pdf
│   │   │   ├── identificacion_QA-2026-013.pdf
│   │   │   ├── identificacion_QA-2026-014.pdf
│   │   │   ├── identificacion_QA-2026-015.pdf
│   │   │   ├── manipulacion_QA-2026-006.pdf
│   │   │   ├── manipulacion_QA-2026-007.pdf
│   │   │   ├── manipulacion_QA-2026-008.pdf
│   │   │   ├── manipulacion_QA-2026-012.pdf
│   │   │   ├── manipulacion_QA-2026-013.pdf
│   │   │   ├── manipulacion_QA-2026-014.pdf
│   │   │   ├── permiso_salud_QA-2026-006.pdf
│   │   │   ├── permiso_salud_QA-2026-007.pdf
│   │   │   ├── permiso_salud_QA-2026-008.pdf
│   │   │   ├── permiso_salud_QA-2026-012.pdf
│   │   │   ├── permiso_salud_QA-2026-013.pdf
│   │   │   ├── permiso_salud_QA-2026-014.pdf
│   │   │   ├── senasa_QA-2026-006.pdf
│   │   │   ├── senasa_QA-2026-007.pdf
│   │   │   ├── senasa_QA-2026-008.pdf
│   │   │   ├── senasa_QA-2026-012.pdf
│   │   │   ├── senasa_QA-2026-013.pdf
│   │   │   ├── senasa_QA-2026-014.pdf
│   │   ├── mock-images/
│   │   │   ├── puesto_QA-2026-001.png
│   │   │   ├── puesto_QA-2026-002.png
│   │   │   ├── puesto_QA-2026-003.png
│   │   │   ├── puesto_QA-2026-004.png
│   │   │   ├── puesto_QA-2026-005.png
│   │   │   ├── puesto_QA-2026-006.png
│   │   │   ├── puesto_QA-2026-007.png
│   │   │   ├── puesto_QA-2026-008.png
│   │   │   ├── puesto_QA-2026-009.png
│   │   │   ├── puesto_QA-2026-010.png
│   │   │   ├── puesto_QA-2026-011.png
│   │   │   ├── puesto_QA-2026-012.png
│   │   │   ├── puesto_QA-2026-013.png
│   │   │   ├── puesto_QA-2026-014.png
│   │   │   ├── puesto_QA-2026-015.png
│   │   ├── scripts/
│   │   │   ├── audit_dead_code.js
│   │   │   ├── check_conflicts.js
│   │   │   ├── check_db.js
│   │   │   ├── check_roles.js
│   │   │   ├── crear-solicitud-productor-fwd.js
│   │   │   ├── crear-solicitud-rechazo-ia.js
│   │   │   ├── demo_ai_reject.js
│   │   │   ├── reset-password.js
│   │   │   ├── reset_admin.js
│   │   │   ├── test-e2e-productor.js
│   │   │   ├── test_endpoints.js
│   │   ├── src/
│   │   │   ├── app.js
│   │   │   ├── socket.js
│   │   │   ├── config/
│   │   │   │   ├── database.js
│   │   │   ├── constants/
│   │   │   │   ├── vehicleTypes.js
│   │   │   ├── controllers/
│   │   │   │   ├── auditController.js
│   │   │   │   ├── authController.js
│   │   │   │   ├── cantonController.js
│   │   │   │   ├── deliveryController.js
│   │   │   │   ├── direccionController.js
│   │   │   │   ├── distritoController.js
│   │   │   │   ├── feriaController.js
│   │   │   │   ├── liquidacionController.js
│   │   │   │   ├── mensajeContactoController.js
│   │   │   │   ├── ofertaProductoController.js
│   │   │   │   ├── permisoController.js
│   │   │   │   ├── platformSettingsController.js
│   │   │   │   ├── productoController.js
│   │   │   │   ├── productorController.js
│   │   │   │   ├── proformaController.js
│   │   │   │   ├── provinciaController.js
│   │   │   │   ├── puestoProductorController.js
│   │   │   │   ├── recetaController.js
│   │   │   │   ├── solicitudCambioRolController.js
│   │   │   │   ├── usuarioController.js
│   │   │   │   ├── ventaProductorController.js
│   │   │   ├── jobs/
│   │   │   │   ├── distributionWorker.js
│   │   │   ├── middlewares/
│   │   │   │   ├── authMiddleware.js
│   │   │   │   ├── cloudinaryMiddleware.js
│   │   │   │   ├── errorHandler.js
│   │   │   │   ├── permisoMiddleware.js
│   │   │   │   ├── roleMiddleware.js
│   │   │   │   ├── uploadRecetaImage.js
│   │   │   │   ├── uploadSelfie.js
│   │   │   ├── models/
│   │   │   │   ├── AuditLog.js
│   │   │   │   ├── Canton.js
│   │   │   │   ├── DeliveryDriver.js
│   │   │   │   ├── DeliveryOrder.js
│   │   │   │   ├── DeliveryRating.js
│   │   │   │   ├── DeliverySetting.js
│   │   │   │   ├── Direccion.js
│   │   │   │   ├── Distrito.js
│   │   │   │   ├── DriverEarnings.js
│   │   │   │   ├── DriverLocation.js
│   │   │   │   ├── Feria.js
│   │   │   │   ├── MensajeContacto.js
│   │   │   │   ├── Modulo.js
│   │   │   │   ├── OfertaProducto.js
│   │   │   │   ├── Permiso.js
│   │   │   │   ├── PlatformSetting.js
│   │   │   │   ├── ProducerEarning.js
│   │   │   │   ├── Producto.js
│   │   │   │   ├── Proforma.js
│   │   │   │   ├── ProformaItem.js
│   │   │   │   ├── Provincia.js
│   │   │   │   ├── PuestoFeria.js
│   │   │   │   ├── PuestoProductor.js
│   │   │   │   ├── Receta.js
│   │   │   │   ├── RecetaIngrediente.js
│   │   │   │   ├── Role.js
│   │   │   │   ├── RolePermiso.js
│   │   │   │   ├── SolicitudCambioRol.js
│   │   │   │   ├── Usuario.js
│   │   │   │   ├── index.js
│   │   │   ├── routes/
│   │   │   │   ├── auditRoutes.js
│   │   │   │   ├── authRoutes.js
│   │   │   │   ├── cantonRoutes.js
│   │   │   │   ├── deliveryRoutes.js
│   │   │   │   ├── direccionRoutes.js
│   │   │   │   ├── distritoRoutes.js
│   │   │   │   ├── feriaRoutes.js
│   │   │   │   ├── index.js
│   │   │   │   ├── liquidacionRoutes.js
│   │   │   │   ├── mensajeContactoRoutes.js
│   │   │   │   ├── ofertaProductoRoutes.js
│   │   │   │   ├── permisoRoutes.js
│   │   │   │   ├── platformSettingsRoutes.js
│   │   │   │   ├── productoRoutes.js
│   │   │   │   ├── productorRoutes.js
│   │   │   │   ├── proformaRoutes.js
│   │   │   │   ├── provinciaRoutes.js
│   │   │   │   ├── puestoProductorRoutes.js
│   │   │   │   ├── recetaRoutes.js
│   │   │   │   ├── solicitudCambioRolRoutes.js
│   │   │   │   ├── usuarioRoutes.js
│   │   │   │   ├── ventaProductorRoutes.js
│   │   │   ├── seeders/
│   │   │   │   ├── 000-seed-roles.js
│   │   │   │   ├── 001-seed-provincias.js
│   │   │   │   ├── 002-seed-cantones.js
│   │   │   │   ├── 003-seed-distritos.js
│   │   │   │   ├── 004-seed-direcciones.js
│   │   │   │   ├── 005-seed-ferias.js
│   │   │   │   ├── 006-seed-usuarios.js
│   │   │   │   ├── 007-seed-productos.js
│   │   │   │   ├── 007a-seed-ofertas.js
│   │   │   │   ├── 008-seed-recetas.js
│   │   │   │   ├── 009-seed-modulos.js
│   │   │   │   ├── 010-seed-permisos.js
│   │   │   │   ├── 011-seed-role-permisos.js
│   │   │   │   ├── 012-seed-platform-settings.js
│   │   │   │   ├── 013-backfill-puesto-ferias.js
│   │   │   ├── services/
│   │   │   │   ├── auditService.js
│   │   │   │   ├── cantonService.js
│   │   │   │   ├── cloudinaryService.js
│   │   │   │   ├── deliveryService.js
│   │   │   │   ├── direccionService.js
│   │   │   │   ├── distritoService.js
│   │   │   │   ├── emailService.js
│   │   │   │   ├── feriaService.js
│   │   │   │   ├── mensajeContactoService.js
│   │   │   │   ├── notificacionService.js
│   │   │   │   ├── ofertaProductoService.js
│   │   │   │   ├── permisoService.js
│   │   │   │   ├── platformSettingsService.js
│   │   │   │   ├── productoService.js
│   │   │   │   ├── productorService.js
│   │   │   │   ├── proformaService.js
│   │   │   │   ├── provinciaService.js
│   │   │   │   ├── puestoProductorService.js
│   │   │   │   ├── recetaService.js
│   │   │   │   ├── solicitudCambioRolService.js
│   │   │   │   ├── usuarioService.js
│   │   │   │   ├── ventaProductorService.js
│   │   │   │   ├── ai/
│   │   │   │   │   ├── groqService.js
│   │   │   │   │   ├── productorAutoReviewer.js
│   │   │   │   │   ├── productorMailTemplates.js
│   │   │   │   │   ├── productorValidator.js
│   │   │   ├── storage/
│   │   │   │   ├── cloudinary-fallback/
│   │   │   │   │   ├── qa-test/
│   │   │   │   │   │   ├── 1779893734939_bc3996129e8a4.txt
│   │   │   │   │   │   ├── 1779893759882_5fd25e9e06b148.txt
│   │   │   ├── tests/
│   │   │   │   ├── auditService.test.js
│   │   │   │   ├── auth.test.js
│   │   │   │   ├── contactMessages.solicitudes.test.js
│   │   │   │   ├── ferias.test.js
│   │   │   │   ├── middleware.auth.test.js
│   │   │   │   ├── permisoMiddleware.test.js
│   │   │   │   ├── productor.test.js
│   │   │   │   ├── productorAutoReviewer.test.js
│   │   │   │   ├── productorValidator.test.js
│   │   │   │   ├── productos.test.js
│   │   │   │   ├── productos.update.test.js
│   │   │   │   ├── puestoFerias.test.js
│   │   │   │   ├── puestoProductor.test.js
│   │   │   │   ├── rbac_security.test.js
│   │   │   │   ├── recetas.test.js
│   │   │   │   ├── setup.js
│   │   │   │   ├── usuarios.test.js
│   │   │   ├── utils/
│   │   │   │   ├── mockProductorFactory.ts
│   │   │   ├── validators/
│   │   │   │   ├── productorApplicationValidator.js
│   │   ├── storage/
│   │   │   ├── qa-assets/
│   │   │   │   ├── carnet_mag_QA-2026-001.pdf
│   │   │   │   ├── carnet_mag_QA-2026-002.pdf
│   │   │   │   ├── carnet_mag_QA-2026-003.pdf
│   │   │   │   ├── carnet_mag_QA-2026-004.pdf
│   │   │   │   ├── carnet_mag_QA-2026-006.pdf
│   │   │   │   ├── carnet_mag_QA-2026-007.pdf
│   │   │   │   ├── carnet_mag_QA-2026-008.pdf
│   │   │   │   ├── carnet_mag_QA-2026-010.pdf
│   │   │   │   ├── carnet_mag_QA-2026-011.pdf
│   │   │   │   ├── carnet_mag_QA-2026-012.pdf
│   │   │   │   ├── carnet_mag_QA-2026-013.pdf
│   │   │   │   ├── carnet_mag_QA-2026-014.pdf
│   │   │   │   ├── carnet_mag_QA-2026-015.pdf
│   │   │   │   ├── certificacion_QA-2026-001.pdf
│   │   │   │   ├── certificacion_QA-2026-002.pdf
│   │   │   │   ├── certificacion_QA-2026-003.pdf
│   │   │   │   ├── certificacion_QA-2026-004.pdf
│   │   │   │   ├── certificacion_QA-2026-005.pdf
│   │   │   │   ├── certificacion_QA-2026-006.pdf
│   │   │   │   ├── certificacion_QA-2026-007.pdf
│   │   │   │   ├── certificacion_QA-2026-008.pdf
│   │   │   │   ├── certificacion_QA-2026-009.pdf
│   │   │   │   ├── certificacion_QA-2026-010.pdf
│   │   │   │   ├── certificacion_QA-2026-011.pdf
│   │   │   │   ├── certificacion_QA-2026-012.pdf
│   │   │   │   ├── certificacion_QA-2026-013.pdf
│   │   │   │   ├── certificacion_QA-2026-014.pdf
│   │   │   │   ├── certificacion_QA-2026-015.pdf
│   │   │   │   ├── identificacion_QA-2026-001.pdf
│   │   │   │   ├── identificacion_QA-2026-002.pdf
│   │   │   │   ├── identificacion_QA-2026-003.pdf
│   │   │   │   ├── identificacion_QA-2026-004.pdf
│   │   │   │   ├── identificacion_QA-2026-005.pdf
│   │   │   │   ├── identificacion_QA-2026-006.pdf
│   │   │   │   ├── identificacion_QA-2026-007.pdf
│   │   │   │   ├── identificacion_QA-2026-008.pdf
│   │   │   │   ├── identificacion_QA-2026-009.pdf
│   │   │   │   ├── identificacion_QA-2026-010.pdf
│   │   │   │   ├── identificacion_QA-2026-011.pdf
│   │   │   │   ├── identificacion_QA-2026-012.pdf
│   │   │   │   ├── identificacion_QA-2026-013.pdf
│   │   │   │   ├── identificacion_QA-2026-014.pdf
│   │   │   │   ├── identificacion_QA-2026-015.pdf
│   │   │   │   ├── manipulacion_QA-2026-006.pdf
│   │   │   │   ├── manipulacion_QA-2026-007.pdf
│   │   │   │   ├── manipulacion_QA-2026-008.pdf
│   │   │   │   ├── manipulacion_QA-2026-012.pdf
│   │   │   │   ├── manipulacion_QA-2026-013.pdf
│   │   │   │   ├── manipulacion_QA-2026-014.pdf
│   │   │   │   ├── permiso_salud_QA-2026-006.pdf
│   │   │   │   ├── permiso_salud_QA-2026-007.pdf
│   │   │   │   ├── permiso_salud_QA-2026-008.pdf
│   │   │   │   ├── permiso_salud_QA-2026-012.pdf
│   │   │   │   ├── permiso_salud_QA-2026-013.pdf
│   │   │   │   ├── permiso_salud_QA-2026-014.pdf
│   │   │   │   ├── puesto_QA-2026-001.png
│   │   │   │   ├── puesto_QA-2026-002.png
│   │   │   │   ├── puesto_QA-2026-003.png
│   │   │   │   ├── puesto_QA-2026-004.png
│   │   │   │   ├── puesto_QA-2026-005.png
│   │   │   │   ├── puesto_QA-2026-006.png
│   │   │   │   ├── puesto_QA-2026-007.png
│   │   │   │   ├── puesto_QA-2026-008.png
│   │   │   │   ├── puesto_QA-2026-009.png
│   │   │   │   ├── puesto_QA-2026-010.png
│   │   │   │   ├── puesto_QA-2026-011.png
│   │   │   │   ├── puesto_QA-2026-012.png
│   │   │   │   ├── puesto_QA-2026-013.png
│   │   │   │   ├── puesto_QA-2026-014.png
│   │   │   │   ├── puesto_QA-2026-015.png
│   │   │   │   ├── senasa_QA-2026-006.pdf
│   │   │   │   ├── senasa_QA-2026-007.pdf
│   │   │   │   ├── senasa_QA-2026-008.pdf
│   │   │   │   ├── senasa_QA-2026-012.pdf
│   │   │   │   ├── senasa_QA-2026-013.pdf
│   │   │   │   ├── senasa_QA-2026-014.pdf
│   ├── FrontEnd/
│   │   ├── .gitignore
│   │   ├── README.md
│   │   ├── eslint.config.js
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite-error.log
│   │   ├── vite-output.log
│   │   ├── vite.config.js
│   │   ├── public/
│   │   │   ├── favicon.png
│   │   │   ├── logo.png
│   │   │   ├── assets/
│   │   │   │   ├── delivery_truck.png
│   │   │   │   ├── driver_avatar.png
│   │   │   │   ├── mapa_colaborativo.jpg
│   │   │   │   ├── carrusel/
│   │   │   │   │   ├── carrusel1.jpg
│   │   │   │   │   ├── carrusel2.jpg
│   │   │   │   │   ├── carrusel3.jpg
│   │   │   │   │   ├── carrusel4.jpg
│   │   │   ├── recetas/
│   │   │   │   ├── hero.jpg
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── Responsive.css
│   │   │   ├── admin-ui.css
│   │   │   ├── index.css
│   │   │   ├── main.tsx
│   │   │   ├── vite-env.d.ts
│   │   │   ├── assets/
│   │   │   │   ├── admin/
│   │   │   │   │   ├── admin-bg.png
│   │   │   │   │   ├── bg-pattern.png
│   │   │   │   │   ├── farmer-portrait.png
│   │   │   ├── components/
│   │   │   │   ├── ActiveFeriasCard/
│   │   │   │   │   ├── ActiveFeriasCard.css
│   │   │   │   │   ├── ActiveFeriasCard.tsx
│   │   │   │   ├── admin/
│   │   │   │   │   ├── AdminLayout/
│   │   │   │   │   │   ├── AdminLayout.css
│   │   │   │   │   │   ├── AdminLayout.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── AdminSidebar/
│   │   │   │   │   │   ├── AdminSidebar.css
│   │   │   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── UserModal/
│   │   │   │   │   │   ├── UserModal.css
│   │   │   │   │   │   ├── UserModal.tsx
│   │   │   │   ├── adminProductor/
│   │   │   │   │   ├── ProductorHeader/
│   │   │   │   │   │   ├── AdminHeader.css
│   │   │   │   │   │   ├── AdminHeader.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── ProductorProductCard/
│   │   │   │   │   │   ├── AdminProductCard.css
│   │   │   │   │   │   ├── AdminProductCard.tsx
│   │   │   │   │   ├── ProductorProductForm/
│   │   │   │   │   │   ├── AdminProductForm.css
│   │   │   │   │   │   ├── AdminProductForm.tsx
│   │   │   │   │   ├── ProductorProductList/
│   │   │   │   │   │   ├── AdminProductList.css
│   │   │   │   │   │   ├── AdminProductList.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── ProductorSidebar/
│   │   │   │   │   │   ├── AdminSidebar.css
│   │   │   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── ProductorStats/
│   │   │   │   │   │   ├── AdminStats.css
│   │   │   │   │   │   ├── AdminStats.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginFormProductor/
│   │   │   │   │   │   ├── LoginForm.css
│   │   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── RegisterFormProductor/
│   │   │   │   │   │   ├── RegisterForm.css
│   │   │   │   │   │   ├── RegisterForm.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   ├── Carousel/
│   │   │   │   │   ├── Carousel.css
│   │   │   │   │   ├── Carousel.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── Cart/
│   │   │   │   │   ├── CartDrawer.css
│   │   │   │   │   ├── CartDrawer.tsx
│   │   │   │   ├── CategoryIcon/
│   │   │   │   │   ├── CategoryIcon.tsx
│   │   │   │   ├── Compare/
│   │   │   │   │   ├── Compare.css
│   │   │   │   │   ├── Compare.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── ContactUs/
│   │   │   │   │   ├── ContactUs.css
│   │   │   │   │   ├── ContactUs.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── context/
│   │   │   │   │   ├── AuthContext.tsx
│   │   │   │   │   ├── CartContext.tsx
│   │   │   │   │   ├── PreferencesContext.tsx
│   │   │   │   │   ├── ThemeContext.tsx
│   │   │   │   ├── CustomDatePicker/
│   │   │   │   │   ├── CustomDatePicker.css
│   │   │   │   │   ├── CustomDatePicker.tsx
│   │   │   │   ├── Delivery/
│   │   │   │   │   ├── CameraCapture.css
│   │   │   │   │   ├── CameraCapture.tsx
│   │   │   │   │   ├── ClientDeliveryTracker.css
│   │   │   │   │   ├── ClientDeliveryTracker.tsx
│   │   │   │   │   ├── DeliveryDashboard.css
│   │   │   │   │   ├── DeliveryDashboard.tsx
│   │   │   │   │   ├── RegistroDelivery.css
│   │   │   │   │   ├── RegistroDelivery.tsx
│   │   │   │   │   ├── Driver/
│   │   │   │   │   │   ├── DriverEarnings.css
│   │   │   │   │   │   ├── DriverEarnings.tsx
│   │   │   │   │   │   ├── DriverLayout.css
│   │   │   │   │   │   ├── DriverLayout.tsx
│   │   │   │   │   │   ├── DriverOrders.css
│   │   │   │   │   │   ├── DriverOrders.tsx
│   │   │   │   │   │   ├── DriverSidebar.css
│   │   │   │   │   │   ├── DriverSidebar.tsx
│   │   │   │   │   ├── liveness/
│   │   │   │   │   │   ├── challenges.ts
│   │   │   │   │   │   ├── faceMetrics.ts
│   │   │   │   │   │   ├── frameValidation.ts
│   │   │   │   │   │   ├── useFaceLandmarker.ts
│   │   │   │   │   │   ├── useLivenessScanner.ts
│   │   │   │   │   │   ├── usePoseLiveness.ts
│   │   │   │   │   │   ├── useQrIdentityScanner.ts
│   │   │   │   │   │   ├── validateChallenge.ts
│   │   │   │   ├── FeaturesSection/
│   │   │   │   │   ├── FeaturesSection.css
│   │   │   │   │   ├── FeaturesSection.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── FeriasGrid/
│   │   │   │   │   ├── FeriaItem.tsx
│   │   │   │   │   ├── FeriasByProvinceList.css
│   │   │   │   │   ├── FeriasByProvinceList.tsx
│   │   │   │   │   ├── ProvinceCard.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── Footer/
│   │   │   │   │   ├── Footer.css
│   │   │   │   │   ├── Footer.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── forms/
│   │   │   │   │   ├── productor/
│   │   │   │   │   │   ├── ProductorWizard.css
│   │   │   │   │   │   ├── ProductorWizard.tsx
│   │   │   │   │   │   ├── components/
│   │   │   │   │   │   │   ├── DocumentDropzone.tsx
│   │   │   │   │   │   │   ├── StepConfirmacion.tsx
│   │   │   │   │   │   │   ├── StepDocumentacion.tsx
│   │   │   │   │   │   │   ├── StepPersonalInfo.tsx
│   │   │   │   │   │   │   ├── StepProduccion.tsx
│   │   │   │   │   │   │   ├── StepPuestoFeria.tsx
│   │   │   │   │   │   │   ├── StepSanitario.tsx
│   │   │   │   │   │   │   ├── StepTributario.tsx
│   │   │   │   │   │   ├── constants/
│   │   │   │   │   │   │   ├── productor.constants.ts
│   │   │   │   │   │   │   ├── productor.defaults.ts
│   │   │   │   │   │   ├── hooks/
│   │   │   │   │   │   │   ├── useDraftAutosave.ts
│   │   │   │   │   │   │   ├── useFormProgress.ts
│   │   │   │   │   │   │   ├── useProductorDraft.ts
│   │   │   │   │   │   │   ├── useRegistroProductor.ts
│   │   │   │   │   │   │   ├── useUploadManager.ts
│   │   │   │   │   │   ├── sections/
│   │   │   │   │   │   │   ├── CalidadSection.tsx
│   │   │   │   │   │   │   ├── ContactoSection.tsx
│   │   │   │   │   │   │   ├── FeriaSection.tsx
│   │   │   │   │   │   │   ├── FotosSection.tsx
│   │   │   │   │   │   │   ├── HorariosSection.tsx
│   │   │   │   │   │   │   ├── MagSection.tsx
│   │   │   │   │   │   │   ├── PersonalSection.tsx
│   │   │   │   │   │   │   ├── ProduccionSection.tsx
│   │   │   │   │   │   │   ├── RevisionSection.tsx
│   │   │   │   │   │   │   ├── SanitarioSection.tsx
│   │   │   │   │   │   │   ├── TributarioSection.tsx
│   │   │   │   │   │   ├── services/
│   │   │   │   │   │   │   ├── productorApplication.service.ts
│   │   │   │   │   │   ├── types/
│   │   │   │   │   │   │   ├── productorApplication.types.ts
│   │   │   │   │   │   │   ├── registro.types.ts
│   │   │   │   │   │   ├── utils/
│   │   │   │   │   │   │   ├── crValidators.ts
│   │   │   │   │   │   │   ├── dateValidators.ts
│   │   │   │   │   │   │   ├── fileUtils.ts
│   │   │   │   │   │   │   ├── fileValidators.ts
│   │   │   │   │   │   │   ├── payloadBuilders.ts
│   │   │   │   │   │   │   ├── productorRules.ts
│   │   │   │   │   │   │   ├── validators.ts
│   │   │   │   │   │   ├── validators/
│   │   │   │   │   │   │   ├── productorApplication.schema.ts
│   │   │   │   ├── HeroSection/
│   │   │   │   │   ├── HeroSection.css
│   │   │   │   │   ├── HeroSection.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── HomeLayout/
│   │   │   │   │   ├── HomeLayout.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── LoginYRegistro/
│   │   │   │   │   ├── LoginYRegistro.css
│   │   │   │   │   ├── LoginYRegistro.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── Map/
│   │   │   │   │   ├── LeafletMap.tsx
│   │   │   │   ├── Navbar/
│   │   │   │   │   ├── Navbar.css
│   │   │   │   │   ├── Navbar.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── ProductComparisonCard/
│   │   │   │   │   ├── ProductComparisonCard.css
│   │   │   │   │   ├── ProductComparisonCard.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── ProductModal/
│   │   │   │   │   ├── ProductModal.css
│   │   │   │   │   ├── ProductModal.tsx
│   │   │   │   ├── Productor/
│   │   │   │   │   ├── Configuracion/
│   │   │   │   │   │   ├── Configuracion.css
│   │   │   │   │   │   ├── Configuracion.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── Dashboard/
│   │   │   │   │   │   ├── Dashboard.css
│   │   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   ├── Ganancias/
│   │   │   │   │   │   ├── Ganancias.css
│   │   │   │   │   │   ├── Ganancias.tsx
│   │   │   │   │   │   ├── VentasReales.tsx
│   │   │   │   │   ├── MisFerias/
│   │   │   │   │   │   ├── MisFerias.css
│   │   │   │   │   │   ├── MisFerias.tsx
│   │   │   │   │   ├── MisProductos/
│   │   │   │   │   │   ├── MisProductos.css
│   │   │   │   │   │   ├── MisProductos.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   ├── Profile/
│   │   │   │   │   ├── Profile.css
│   │   │   │   │   ├── Profile.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── Proforma/
│   │   │   │   │   ├── Proforma.css
│   │   │   │   │   ├── ProformaPage.tsx
│   │   │   │   ├── Recipes/
│   │   │   │   │   ├── Recipes.css
│   │   │   │   │   ├── Recipes.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── RegistroProductor/
│   │   │   │   │   ├── DocUploadField.tsx
│   │   │   │   │   ├── RegistroProductor.css
│   │   │   │   │   ├── RegistroProductor.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── registroProductorExtend.ts
│   │   │   │   ├── SidebarFilters/
│   │   │   │   │   ├── SidebarFilters.css
│   │   │   │   │   ├── SidebarFilters.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── StatsBar/
│   │   │   │   │   ├── StatsBar.css
│   │   │   │   │   ├── StatsBar.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useFerias.ts
│   │   │   │   ├── useGroupedFerias.ts
│   │   │   ├── pages/
│   │   │   │   ├── Comparar.tsx
│   │   │   │   ├── Ferias.tsx
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── LoginYRegistro.tsx
│   │   │   │   ├── Pages.css
│   │   │   │   ├── Profile.tsx
│   │   │   │   ├── Recetas.tsx
│   │   │   │   ├── RecuperarPassword.tsx
│   │   │   │   ├── RegistroProductor.tsx
│   │   │   │   ├── ResetPassword.tsx
│   │   │   │   ├── Admin/
│   │   │   │   │   ├── AdminConfiguracion/
│   │   │   │   │   │   ├── AdminConfiguracion.css
│   │   │   │   │   │   ├── AdminConfiguracion.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── AdminContactos/
│   │   │   │   │   │   ├── AdminContactos.css
│   │   │   │   │   │   ├── AdminContactos.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── AdminDashboard/
│   │   │   │   │   │   ├── AdminDashboard.css
│   │   │   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── AdminFerias/
│   │   │   │   │   │   ├── AdminFerias.css
│   │   │   │   │   │   ├── AdminFerias.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── AdminLiquidaciones/
│   │   │   │   │   │   ├── AdminLiquidaciones.tsx
│   │   │   │   │   ├── AdminProductores/
│   │   │   │   │   │   ├── AdminProductores.css
│   │   │   │   │   │   ├── AdminProductores.tsx
│   │   │   │   │   ├── AdminProductos/
│   │   │   │   │   │   ├── AdminProductos.css
│   │   │   │   │   │   ├── AdminProductos.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── AdminRecetas/
│   │   │   │   │   │   ├── AdminRecetas.css
│   │   │   │   │   │   ├── AdminRecetas.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── AdminRepartidores/
│   │   │   │   │   │   ├── AdminRepartidores.tsx
│   │   │   │   │   ├── AdminSolicitudes/
│   │   │   │   │   │   ├── AdminSolicitudes.tsx
│   │   │   │   │   ├── AdminUsuarios/
│   │   │   │   │   │   ├── AdminUsuarios.css
│   │   │   │   │   │   ├── AdminUsuarios.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   ├── routes/
│   │   │   │   ├── Routing.tsx
│   │   │   │   ├── ProtectedRoute/
│   │   │   │   │   ├── ProtectedRoute.css
│   │   │   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── services/
│   │   │   │   ├── AuthService.ts
│   │   │   │   ├── ProductService.ts
│   │   │   │   ├── api.config.ts
│   │   │   │   ├── api.ts
│   │   │   │   ├── cloudinary.service.ts
│   │   │   │   ├── deliveryService.ts
│   │   │   │   ├── feriasFallbackService.ts
│   │   │   │   ├── geocodingService.ts
│   │   │   │   ├── googleMapsService.ts
│   │   │   │   ├── productorService.ts
│   │   │   ├── types/
│   │   │   │   ├── feria.types.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── province.types.ts
│   │   │   ├── utils/
│   │   │   │   ├── categoryIcons.ts
│   │   │   │   ├── escapeHtml.ts
│   │   │   │   ├── feriaSchedule.ts
│   │   │   │   ├── groupByProvince.ts
│   │   │   │   ├── productCatalog.ts
│   │   │   │   ├── productIcons.tsx
│   │   │   │   ├── validation.ts
```

## Contenido de Archivos

## Archivo: `Semilla-digital\.gitignore`

# Dependencias

node_modules/

# Variables de entorno (cada subproyecto tiene su propio .env)

.env
.env.local
.env.\*.local
automatizacion.md

# Logs

_.log
npm-debug.log_
yarn-debug.log\*

# Builds

dist/
build/
dist-ssr/
coverage/
.vite/
auditoria-literales-codigo-muerto.md
claude.md

# Editor / OS

.vscode/_
!.vscode/extensions.json
.idea/
.DS_Store
_.suo
_.ntvs_
_.njsproj
_.sln
_.sw?
Thumbs.db
_.swp
\*.swo

# Backups y dumps temporales

_.bak
respaldo\__.sql
\*.sql

# package.json/lock accidentales en la raíz (las dependencias van en BackEnd/ y FrontEnd/)

/package.json
/package-lock.json

# Metadata local de herramientas (Claude Code, etc.)

.claude/
