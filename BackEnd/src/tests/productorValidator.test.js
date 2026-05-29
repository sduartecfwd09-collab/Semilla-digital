// ============================================================
// Tests: productorValidator
// Cubre el filtro defensivo `filtrarMotivosAlucinados` que sanea
// los motivos devueltos por el LLM contra reglas duras codificadas
// (p. ej. carné sanitario solo aplica a ciertos tipos de producto).
// ============================================================
'use strict';

const { filtrarMotivosAlucinados } = require('../services/ai/productorValidator');

describe('productorValidator.filtrarMotivosAlucinados', () => {
  test('descarta motivo de carné sanitario si tipos NO lo requieren', () => {
    const out = filtrarMotivosAlucinados(
      {
        aprobado: false,
        faltantes: [
          'Descripción del puesto no corresponde a una actividad agrícola',
          'Falta carnet de manipulación de alimentos',
        ],
        resumen: 'x',
      },
      { tiposProducto: ['Verduras', 'Frutas'] }
    );
    expect(out.aprobado).toBe(false);
    expect(out.faltantes).toEqual([
      'Descripción del puesto no corresponde a una actividad agrícola',
    ]);
  });

  test('NO descarta motivo de carné sanitario si tipos SÍ lo requieren', () => {
    const out = filtrarMotivosAlucinados(
      {
        aprobado: false,
        faltantes: ['Falta carnet de manipulación de alimentos'],
        resumen: 'x',
      },
      { tiposProducto: ['Lácteos'] }
    );
    expect(out.faltantes).toContain('Falta carnet de manipulación de alimentos');
  });

  test('si tras filtrar queda 0 motivos, marca para revisión manual (NO aprueba)', () => {
    const out = filtrarMotivosAlucinados(
      {
        aprobado: false,
        faltantes: ['Falta carné de manipulación'],
        resumen: 'x',
      },
      { tiposProducto: ['Verduras'] }
    );
    expect(out.aprobado).toBe(false);
    expect(out.faltantes).toHaveLength(1);
    expect(out.faltantes[0]).toMatch(/revisión manual/i);
  });

  test('decisión aprobada se devuelve sin tocar', () => {
    const input = { aprobado: true, faltantes: [], resumen: 'ok' };
    const out = filtrarMotivosAlucinados(input, { tiposProducto: ['Verduras'] });
    expect(out).toBe(input);
  });

  test('acepta variante "carné" (con tilde) y snake_case tipos_producto', () => {
    const out = filtrarMotivosAlucinados(
      {
        aprobado: false,
        faltantes: [
          'Motivo legítimo',
          'No presenta carné de manipulación de alimentos',
        ],
        resumen: 'x',
      },
      { tipos_producto: ['Hierbas'] }
    );
    expect(out.faltantes).toEqual(['Motivo legítimo']);
  });

  test('descarta reformulaciones sanitarias sin la palabra "carnet"', () => {
    const motivosAlucinados = [
      'Registro sanitario y manipulación de alimentos no está completo',
      'Falta permiso del Ministerio de Salud',
      'Registro SENASA no presentado',
      'No tiene carné sanitario',
      'Manipulación de alimentos sin certificar',
      'No se presentan documentos sanitarios completos',
      'Falta documento sanitario',
    ];
    motivosAlucinados.forEach((motivo) => {
      const out = filtrarMotivosAlucinados(
        { aprobado: false, faltantes: ['Motivo válido', motivo], resumen: 'x' },
        { tiposProducto: ['Verduras'] }
      );
      expect(out.faltantes).toEqual(['Motivo válido']);
    });
  });

  test('los motivos sanitarios SÍ se mantienen si tipos requieren sanitario', () => {
    const motivos = [
      'Falta permiso del Ministerio de Salud',
      'Registro SENASA no presentado',
    ];
    const out = filtrarMotivosAlucinados(
      { aprobado: false, faltantes: motivos, resumen: 'x' },
      { tiposProducto: ['Embutidos'] }
    );
    expect(out.faltantes).toEqual(motivos);
  });
});
