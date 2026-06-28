import React, { useState, useEffect } from 'react';

export default function FormularioAbono() {
  // Estados del Formulario
  const [viajeId, setViajeId] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [montoOriginal, setMontoOriginal] = useState('');
  const [monedaOriginal, setMonedaOriginal] = useState('COP');
  const [trmDigitada, setTrmDigitada] = useState('1');
  const [medio, setMedio] = useState('Transferencia');
  const [cuentaDestino, setCuentaDestino] = useState('Cuenta de Ahorros Principal');
  const [descripcion, setDescripcion] = useState('');

  // Datos simulados (Se conectarán a tus endpoints de Supabase)
  const [viajesActivos] = useState([
    { id: 1, destino: 'Coiba, Panamá - Julio 2026' },
    { id: 2, destino: 'Mar Rojo - Octubre 2027' }
  ]);

  const [clientes] = useState([
    { id: 4, nombre: 'Carlos Mendoza', identificacion: '10203040' },
    { id: 5, nombre: 'Ana María Restrepo', identificacion: '98765432' }
  ]);

  // Lógica reactiva para la TRM según la divisa
  useEffect(() => {
    if (monedaOriginal === 'COP') {
      setTrmDigitada('1');
    } else {
      setTrmDigitada('');
    }
  }, [monedaOriginal]);

  // Cálculo en tiempo real
  const montoCalculadoCop = parseFloat(montoOriginal || 0) * parseFloat(trmDigitada || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Enviando transacción financiera...');
  };

  return (
    // 1. ENVOLTURA PRINCIPAL OSCURA (Reemplaza al contenedor blanco original)
    <div className="max-w-2xl mx-auto my-4 bg-[#1b2436] rounded-xl shadow-lg overflow-hidden border border-[#243049] font-sans text-slate-200">
      
      {/* ENCABEZADO DE LA TARJETA */}
      <div className="bg-[#141923] border-b border-[#243049] px-6 py-5">
        <h2 className="text-xl font-bold text-white">Registrar Entrada / Salida</h2>
        <p className="text-sm text-slate-400 mt-1">Módulo de recaudo y control financiero para expediciones</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* SELECTORES DE VIAJE Y CLIENTE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Seleccionar Viaje / Destino</label>
            <select
              value={viajeId}
              onChange={(e) => setViajeId(e.target.value)}
              className="w-full px-3 py-2 bg-[#12131a] border border-[#243049] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              required
            >
              <option value="" className="bg-[#141923]">-- Seleccione un viaje --</option>
              {viajesActivos.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#141923]">{v.destino}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Buceador / Cliente</label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full px-3 py-2 bg-[#12131a] border border-[#243049] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              required
            >
              <option value="" className="bg-[#141923]">-- Seleccione el cliente --</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#141923]">{c.nombre} ({c.identificacion})</option>
              ))}
            </select>
          </div>
        </div>

        {/* SELECTOR DE DIVISA COMPATIBLE */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Divisa del Pago</label>
          <div className="grid grid-cols-3 gap-3">
            {['COP', 'USD', 'EUR'].map((moneda) => (
              <label
                key={moneda}
                className={`flex items-center justify-center py-3 px-4 border rounded-xl cursor-pointer font-bold text-sm transition-all shadow-sm
                  ${monedaOriginal === moneda 
                    ? 'bg-blue-600 border-blue-600 text-white ring-2 ring-blue-500/30' 
                    : 'bg-[#12131a] border-[#243049] text-slate-300 hover:bg-[#1a2130]'
                  }`}
              >
                <input
                  type="radio"
                  name="monedaOriginal"
                  value={moneda}
                  checked={monedaOriginal === moneda}
                  onChange={(e) => setMonedaOriginal(e.target.value)}
                  className="sr-only"
                />
                {moneda}
              </label>
            ))}
          </div>
        </div>

        {/* INPUTS DE MONTO Y TRM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Monto Original</label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 text-sm font-medium">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={montoOriginal}
                onChange={(e) => setMontoOriginal(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 bg-[#12131a] border border-[#243049] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">TRM del Día</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={trmDigitada}
              onChange={(e) => setTrmDigitada(e.target.value)}
              disabled={monedaOriginal === 'COP'}
              placeholder="Ej: 4050.00"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-sm transition-all
                ${monedaOriginal === 'COP' 
                  ? 'bg-[#151a24] border-[#243049] text-slate-500 font-medium cursor-not-allowed' 
                  : 'bg-[#12131a] border-[#243049] focus:ring-2 focus:ring-blue-500 text-white'
                }`}
              required
            />
          </div>
        </div>

        {/* MEDIO DE PAGO Y CAJAS DESTINO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Medio de Pago</label>
            <select
              value={medio}
              onChange={(e) => setMedio(e.target.value)}
              className="w-full px-3 py-2 bg-[#12131a] border border-[#243049] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Efectivo" className="bg-[#141923]">Efectivo</option>
              <option value="Transferencia" className="bg-[#141923]">Transferencia</option>
              <option value="Tarjeta de Crédito" className="bg-[#141923]">Tarjeta de Crédito</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Cuenta / Caja Destino</label>
            <select
              value={cuentaDestino}
              onChange={(e) => setCuentaDestino(e.target.value)}
              className="w-full px-3 py-2 bg-[#12131a] border border-[#243049] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Cuenta de Ahorros Principal" className="bg-[#141923]">Cuenta de Ahorros Principal</option>
              <option value="ARD Dollar App" className="bg-[#141923]">ARD Dollar App</option>
              <option value="Caja Menor" className="bg-[#141923]">Caja Menor</option>
            </select>
          </div>
        </div>

        {/* OBSERVACIONES */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">Observaciones / Descripción (Opcional)</label>
          <textarea
            rows="2"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Detalles específicos del abono..."
            className="w-full px-3 py-2 bg-[#12131a] border border-[#243049] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* DISPLAY CONSOLIDADO EN TIEMPO REAL */}
        <div className="p-4 bg-[#12131a] border border-[#243049] rounded-xl text-white flex justify-between items-center shadow-inner">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-black text-slate-400">Total Consolidado</span>
            <h3 className="text-xs font-bold text-slate-300">Monto Calculado en COP</h3>
          </div>
          <span className="text-xl font-black text-emerald-400 font-mono">
            $ {montoCalculadoCop.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* BOTÓN DE ACCIÓN */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none"
        >
          Guardar Registro Financiero
        </button>

      </form>
    </div>
  );
}