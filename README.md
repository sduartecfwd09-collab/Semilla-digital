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

\_.bak
respaldo\_\_.sql
\*.sql

# package.json/lock accidentales en la raíz (las dependencias van en BackEnd/ y FrontEnd/)

/package.json
/package-lock.json

# Metadata local de herramientas (Claude Code, etc.)

.claude/

## Archivo: `Semilla-digital\README.md`

# AgroMap

AgroMap es una plataforma para descubrir y comparar precios en las ferias del productor de Costa Rica. Permite a los **usuarios** ver productos, comparar precios entre ferias y generar proformas; a los **productores** gestionar su puesto, productos y ganancias; y a los **administradores** gestionar usuarios, ferias, recetas, mensajes y solicitudes de cambio de rol.

Stack: **Node.js + Express + Sequelize + MySQL** en el backend, **React + TypeScript + Vite** en el frontend.

## Requisitos previos

- **Node.js** ≥ 18 (probado con 24.x)
- **MySQL** ≥ 8.x corriendo localmente
- **npm** (viene con Node)

## Estructura del repositorio

````

Semilla-digital/ ← raíz del repo
├── README.md ← este archivo
├── .gitignore
├── BackEnd/ ← API REST (Express + Sequelize)
│ ├── src/
│ │ ├── app.js
│ │ ├── config/ ← config Sequelize (no usado; ver Config/)
│ │ ├── controllers/ ← un controller por recurso
│ │ ├── middlewares/ ← authMiddleware, roleMiddleware, etc.
│ │ ├── models/ ← modelos Sequelize + associations
│ │ ├── routes/ ← routers de Express
│ │ ├── seeders/ ← datos demo
│ │ ├── services/ ← lógica de negocio
│ │ └── tests/ ← Jest + supertest (87 tests)
│ ├── Config/config.js ← config Sequelize-CLI (esta es la que se usa)
│ ├── Migrations/ ← migraciones Sequelize
│ ├── scripts/ ← utilidades fuera del flujo normal
│ │ ├── check_db.js
│ │ └── reset-password.js
│ ├── .env ← (no committeado) credenciales y JWT_SECRET
│ └── package.json
└── FrontEnd/ ← SPA (React + TypeScript + Vite)
├── src/
│ ├── App.tsx, main.tsx
│ ├── components/ ← UI por dominio
│ │ ├── admin/ ← panel administrador
│ │ ├── adminProductor/ ← panel productor
│ │ ├── auth/
│ │ ├── context/ ← AuthContext, CartContext
│ │ ├── Cart/, Compare/, ContactUs/, Footer/, HeroSection/,
│ │ │ Map/, Navbar/, ProductModal/, Profile/, Proforma/,
│ │ │ Recipes/, RegistroProductor/, Productor/, ...
│ ├── hooks/ ← useFerias, useGroupedFerias
│ ├── pages/ ← rutas top-level (Home, Comparar, ...)
│ ├── routes/ ← Routing.tsx, ProtectedRoute
│ ├── services/ ← api.config, api, AuthService,
│ │ ProductService, ProductorServices,
│ │ geocoding, googleMaps
│ ├── types/, utils/
├── .env ← (no committeado) VITE_API_URL, VITE_GOOGLE_MAPS_KEY
└── package.json
ini
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=AgroMap
JWT_SECRET=usa_un_string_aleatorio_largo_de_64+\_bytes
PORT=3002
NODE_ENV=development

# Opcional: orígenes permitidos por CORS (lista CSV).

# Default: http://localhost:5173,http://localhost:3000,http://localhost:4173

# CORS_ORIGINS=http://localhost:5173

bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
ini
VITE_API_URL=http://localhost:3002

# Si vas a usar Google Places en vez del modo mock:

# VITE_GOOGLE_MAPS_KEY=tu_api_key

bash
mysql -u root -p -e "CREATE DATABASE AgroMap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
bash
cd BackEnd
npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev # arranca con nodemon en :3002
bash
cd FrontEnd
npm install
npm run dev # Vite en :5173
bash
cd BackEnd
npm test

## Archivo: `Semilla-digital\BackEnd\.env`

# ============================================================

# Plantilla de variables de entorno para AgroMap BackEnd

# Copiá este archivo a `.env` y completá los valores reales.

# NO commitees `.env` (ya está en .gitignore).

# ============================================================

# ── Servidor ────────────────────────────────────────────────

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=1234
DB_NAME=AgroMap
PORT=3002
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:4173

# ── JWT ─────────────────────────────────────────────────────

JWT_SECRET=tu_jwt_secret_aqui
JWT_EXPIRES_IN=1h

# ── Email (Gmail SMTP) ──────────────────────────────────────

# 1. Activá verificación en 2 pasos en https://myaccount.google.com

# 2. Generá una "Contraseña de aplicación" de 16 caracteres

# 3. Pegala en SMTP_PASS (no uses tu contraseña personal)

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=agromapcorp@gmail.com
SMTP_PASS=tu_contrasena_de_aplicacion_aqui
SMTP_FROM=AgroMap <agromapcorp@gmail.com>

# ── IA: Groq (gratuito) ─────────────────────────────────────

# API key: https://console.groq.com/keys

GROQ_API_KEY=tu_groq_api_key_aqui
GROQ_MODEL=llama-3.3-70b-versatile

# ── Auto-revisión de solicitudes de Productor ───────────────

# "true" para activar la validación automática con IA y email.

# "false" mantiene el flujo manual del administrador.

AI_AUTO_REVIEW_ENABLED=true

# Si la IA falla (timeout/cuota), se notifica acá y la solicitud

# queda Pendiente para revisión manual.

AI_FALLBACK_NOTIFY_EMAIL=agromapcorp@gmail.com

## Archivo: `Semilla-digital\BackEnd\.gitignore`

node_modules/
.env
\*.log
dist/
build/
coverage/
.vscode/
.DS_Store

## Archivo: `Semilla-digital\BackEnd\.sequelizerc`

const path = require('path');

module.exports = {
'config': path.resolve('Config', 'config.js'),
'models-path': path.resolve('src', 'models'),
'migrations-path': path.resolve('migrations'),
'seeders-path': path.resolve('src', 'seeders'),
};

## Archivo: `Semilla-digital\BackEnd\agent.md`

```markdown
Eres el especialista encargado del backend simulado y la capa de servicios de AgroMap.

1. Gestión del Esquema de Datos (db.json)
   Cada vez que se sugiera una nueva funcionalidad, debes definir primero la estructura de los objetos en db.json
   .
   Asegúrate de mantener las relaciones consistentes entre entidades (ej: semillas, productos, productores)
   .
   Regla: Antes de modificar el archivo, verifica que los IDs sigan un patrón consistente para evitar conflictos en el CRUD
   .
2. Desarrollo de la Capa de Servicios (src/servers/)
   Crea o actualiza archivos en src/servers/ para encapsular las peticiones fetch o axios.
   Protocolo: Todas las funciones de servicio deben estar tipadas con interfaces de TypeScript que reflejen la estructura de db.json
   .
   Implementa manejo de errores robusto para cada endpoint (GET, POST, PUT, DELETE).
3. Configuración del Servidor Personalizado
   Si se requiere lógica personalizada (filtros, validaciones, límites), debes trabajar sobre server.cjs o limit-fix.cjs
   .
   Asegúrate de que cualquier cambio sea compatible con el comando npm run server
   .
   Protocolo de Trabajo
   Validación de Datos: Antes de escribir código frontend, define el contrato de la API (endpoint y formato JSON).
   Mantenimiento de Mock: Si se agregan nuevas páginas, genera datos de prueba (seed data) realistas en db.json para facilitar el desarrollo
   .
   Sincronización: Asegúrate de que las URLs de los servicios apunten siempre al puerto 3002 definido en el proyecto
````

## Archivo: `Semilla-digital\FrontEnd\.gitignore`

# Logs

logs
_.log
npm-debug.log_
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
node_modules
dist
dist-ssr
\*.local
.vite

# Editor directories and files

.vscode/_
!.vscode/extensions.json
.idea
.DS_Store
_.suo
_.ntvs_
_.njsproj
_.sln
\*.sw?

# Environment files

.env
.env.local
.env.\*.local

## Archivo: `Semilla-digital\FrontEnd\README.md`

````markdown
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

#  AgroMap – Semilla Digital

##  Descripción

**AgroMap – Semilla Digital** es una aplicación web desarrollada con **React y Vite** que permite gestionar y visualizar información relacionada con el sector agrícola. El proyecto integra una API simulada mediante **json-server**, facilitando el manejo de datos de forma sencilla durante el desarrollo.

El objetivo principal es ofrecer una plataforma interactiva y eficiente para la administración y consulta de información agrícola.

Actualmente incluye:

- Sistema de autenticación (login).
- Funcionalidad de comparación de productos/semillas.
- Estructura modular con páginas y componentes reutilizables.
- Backend simulado con `db.json` (ideal para desarrollo y pruebas).

---

##  Tecnologías utilizadas

*  React 19
*  Vite
*  React Router DOM
*  React Icons / Lucide React
*  SweetAlert2
*  JSON Server (API simulada)
\*  ESLint

---

## Estructura del proyecto

Semilla-digital/
├── public/             # Archivos estáticos públicos
├── src/
│   ├── assets/         # Imágenes, fuentes, etc.
│   ├── components/     # Componentes reutilizables
│   ├── pages/          # Vistas/páginas principales
│   ├── routes/         # Configuración de rutas
│   ├── servers/        # Lógica de servicios o mocks
│   ├── App.jsx         # Componente raíz
│   ├── main.jsx        # Punto de entrada
│   └── ...
├── db.json             # Base de datos mock (semillas, productos, etc.)
├── vite.config.js      # Configuración de Vite
├── package.json
└── README.md

---

## Instalación

Sigue estos pasos para ejecutar el proyecto localmente:

```bash
# 1. Clonar el repositorio
git clone <https://github.com/sduartecfwd09-collab/Semilla-digital.git>

# 2. Entrar al proyecto
cd Semilla-digital

# 3. Instalar dependencias
npm install
bash
npm run dev       # Ejecuta la app en modo desarrollo
npm run build     # Construye la aplicación para producción
npm run preview   # Previsualiza la build
npm run server    # Ejecuta la API local con json-server
npm run lint      # Analiza el código con ESLint

```
````
