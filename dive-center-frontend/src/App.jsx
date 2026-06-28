import React, { useState, useEffect } from 'react';

// CONFIGURACIÓN DE TU CONEXIÓN REAL A SUPABASE
const SUPABASE_URL = "https://tbpmvtisudzszjjtbfed.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG12dGlzdWR6c3pqanRiZmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjM3OTQsImV4cCI6MjA5Nzg5OTc5NH0.cZc8VF_f5JrsbjJDfMqLHYHElxBB-O6eHu9RcwIT2c4";

// Instancia global del cliente de Supabase que se inicializa al cargar la librería
let supabaseInstance = null;

// Helper para obtener el cliente de Supabase de manera dinámica
function getSupabase() {
  if (supabaseInstance) return supabaseInstance;
  if (window.supabase) {
    supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseInstance;
  }
  return null;
}

// ==========================================
// 1. COMPONENTE: FORMULARIO DE REGISTRO (FINANZAS SINCRO CON SUPABASE)
// ==========================================
function FormularioAbono({ viajes, clientes, proveedores, agregarTransaccion }) {
  const [viajeId, setViajeId] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [montoOriginal, setMontoOriginal] = useState('');
  const [trmDigitada, setTrmDigitada] = useState('4000');
  const [medio, setMedio] = useState('Transferencia');
  const [cuentaOrigenDestino, setCuentaOrigenDestino] = useState('Cuenta de Ahorros Principal');
  const [descripcion, setDescripcion] = useState('');
  const [tipoMovimiento, setTipoMovimiento] = useState('Ingreso');
  const [monedaState, setMonedaState] = useState('COP');
  const [mensajeExito, setMensajeExito] = useState(false);

  // Obtener información del viaje seleccionado
  const viajeSeleccionado = viajes.find(v => v.id === parseInt(viajeId));

  useEffect(() => {
    if (monedaState === 'COP') {
      setTrmDigitada('1');
    } else if (trmDigitada === '1' || !trmDigitada) {
      setTrmDigitada('4000');
    }
  }, [monedaState]);

  const montoNum = parseFloat(montoOriginal || 0);
  const trmNum = parseFloat(trmDigitada || 1);
  
  let equivalenciaTexto = '';
  let montoCopCalculado = 0;

  if (monedaState === 'COP') {
    montoCopCalculado = montoNum;
    if (viajeSeleccionado && viajeSeleccionado.divisa_base === 'USD') {
      const dolaresAbonados = montoNum / trmNum;
      equivalenciaTexto = `= $ ${dolaresAbonados.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD aportados al saldo del viaje`;
    }
  } else {
    montoCopCalculado = montoNum * trmNum;
    equivalenciaTexto = `= $ ${montoCopCalculado.toLocaleString('es-CO', { maximumFractionDigits: 0 })} COP ingresados a caja`;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!viajeId || !montoOriginal) return;

    const clienteSeleccionado = clientes.find(c => c.id === parseInt(clienteId));
    const proveedorSeleccionado = proveedores.find(p => p.id === parseInt(proveedorId));

    const nuevaTrans = {
      tipo: tipoMovimiento,
      monto_original: parseFloat(montoOriginal),
      moneda_original: monedaState,
      trm_digitada: parseFloat(trmDigitada),
      viaje_id: parseInt(viajeId),
      cliente_id: tipoMovimiento === 'Ingreso' ? (clienteId ? parseInt(clienteId) : null) : null,
      proveedor_id: tipoMovimiento === 'Salida' ? (proveedorId ? parseInt(proveedorId) : null) : null,
      descripcion: descripcion || `${tipoMovimiento === 'Ingreso' ? 'Abono de ' + (clienteSeleccionado ? clienteSeleccionado.nombre_completo : 'Buzo') : 'Gasto con ' + (proveedorSeleccionado ? proveedorSeleccionado.nombre_comercial : 'Proveedor')} expedición`,
      medio: medio,
      cuenta_origen_destino: cuentaOrigenDestino
    };

    // Agregar de forma asíncrona mediante prop
    await agregarTransaccion(nuevaTrans);

    setMontoOriginal('');
    setDescripcion('');
    setMensajeExito(true);
    setTimeout(() => setMensajeExito(false), 4000);
  };

  return (
    <div className="bg-[#0b1528]/80 backdrop-blur-xl border border-cyan-500/15 rounded-3xl p-4 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-cyan-500/30 relative">
      
      {mensajeExito && (
        <div className="absolute top-4 left-4 right-4 bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl z-50 animate-bounce">
          <span className="text-xl">✓</span>
          <div>
            <p className="font-black text-sm uppercase tracking-wider">¡Registro Exitoso!</p>
            <p className="text-xs opacity-80">El movimiento financiero ha sido cargado exitosamente a la base de datos.</p>
          </div>
        </div>
      )}

      <div className="mb-8 border-b border-slate-700/50 pb-5">
        <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/50 px-3 py-1.5 rounded-full border border-cyan-500/20">
          Módulo de Recaudo
        </span>
        <h3 className="text-2xl font-black text-white mt-4">Registrar Entrada / Salida</h3>
        <p className="text-sm text-slate-400">Ingresa cobros a clientes o egresos de logística asociados a expediciones</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Tipo de Transacción</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTipoMovimiento('Ingreso')}
              className={`py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border
                ${tipoMovimiento === 'Ingreso' 
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                  : 'bg-[#070e1b] border-slate-800 text-slate-500 hover:text-slate-300'}`}
            >
              🟢 Ingreso (Abono Buzo)
            </button>
            <button
              type="button"
              onClick={() => setTipoMovimiento('Salida')}
              className={`py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border
                ${tipoMovimiento === 'Salida' 
                  ? 'bg-rose-950/60 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                  : 'bg-[#070e1b] border-slate-800 text-slate-500 hover:text-slate-300'}`}
            >
              🔴 Salida (Gasto de Viaje)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Asociar a Expedición</label>
            <select
              value={viajeId}
              onChange={(e) => setViajeId(e.target.value)}
              className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              required
            >
              <option value="">-- Elige un destino --</option>
              {viajes.map((v) => (
                <option key={v.id} value={v.id}>{v.destino} ({v.fecha_salida} al {v.fecha_regreso}) [{v.divisa_base}]</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {tipoMovimiento === 'Ingreso' ? 'Buceador / Cliente' : 'Tercero / Proveedor Destinatario'}
            </label>
            {tipoMovimiento === 'Ingreso' ? (
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                required
              >
                <option value="">-- Seleccionar Buceador --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre_completo} {c.loyalty ? '⭐' : ''}</option>
                ))}
              </select>
            ) : (
              <select
                value={proveedorId}
                onChange={(e) => setProveedorId(e.target.value)}
                className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                required
              >
                <option value="">-- Seleccionar Proveedor --</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre_comercial} [{p.tipo_servicio}]</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Divisa de Recepción</label>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {['COP', 'USD', 'EUR'].map((moneda) => (
              <label
                key={moneda}
                className={`flex flex-col items-center justify-center py-4 rounded-2xl cursor-pointer border font-black text-sm transition-all duration-300
                  ${monedaState === moneda 
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-105' 
                    : 'bg-[#070e1b]/80 border-slate-700/80 text-slate-400 hover:border-slate-600 hover:text-white'
                  }`}
              >
                <input
                  type="radio"
                  name="monedaState"
                  value={moneda}
                  checked={monedaState === moneda}
                  onChange={(e) => setMonedaState(e.target.value)}
                  className="sr-only"
                />
                <span className="text-base tracking-widest">{moneda}</span>
                <span className="text-[9px] opacity-75 font-medium mt-0.5 text-center px-1">
                  {moneda === 'COP' ? 'Caja COP' : 'Divisa'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Monto</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-cyan-400 font-mono">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={montoOriginal}
                onChange={(e) => setMontoOriginal(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#070e1b] border border-slate-700/60 rounded-xl pl-8 pr-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                required
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">TRM Aplicada</label>
            <input
              type="number"
              step="0.01"
              value={trmDigitada}
              onChange={(e) => setTrmDigitada(e.target.value)}
              disabled={monedaState === 'COP'}
              placeholder="Digite TRM manual"
              className={`w-full bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-3 font-mono focus:outline-none transition-all
                ${monedaState === 'COP' 
                  ? 'bg-[#050b14]/50 border-slate-800 text-slate-500 cursor-not-allowed opacity-60' 
                  : 'text-white focus:ring-2 focus:ring-cyan-500/50'
                }`}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Medio de Pago</label>
            <select
              value={medio}
              onChange={(e) => setMedio(e.target.value)}
              className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Caja Destino / Origen</label>
            <select
              value={cuentaOrigenDestino}
              onChange={(e) => setCuentaOrigenDestino(e.target.value)}
              className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="Cuenta de Ahorros Principal">Cuenta de Ahorros Principal</option>
              <option value="Cuenta Personal Builes">Cuenta Personal Builes</option>
              <option value="ARD Dollar App">ARD Dollar App</option>
              <option value="Caja Menor">Caja Menor</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Concepto / Detalles</label>
          <textarea
            rows="2"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Añade detalles específicos del abono o pago..."
            className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        <div className="relative overflow-hidden bg-gradient-to-r from-[#0a1b2d] to-[#04111f] border border-cyan-500/30 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-black text-cyan-400 block mb-1">Cálculo de Moneda</span>
            <h4 className="text-sm font-semibold text-slate-200">
              {viajeSeleccionado ? `Destino cotizado en: ${viajeSeleccionado.divisa_base}` : 'Seleccione un destino arriba'}
            </h4>
            {equivalenciaTexto && (
              <span className="text-[11px] text-amber-400 mt-1 block font-medium">{equivalenciaTexto}</span>
            )}
          </div>
          <div className="text-right w-full sm:w-auto">
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 block mb-1">Equivalencia instantánea</span>
            <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 font-mono tracking-wide block sm:inline">
              $ {montoCopCalculado.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              <span className="text-xs font-bold ml-1 text-slate-400">COP</span>
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-widest py-4 rounded-2xl shadow-[0_10px_25px_rgba(245,158,11,0.2)] transition-all transform active:scale-[0.98]"
        >
          Guardar Movimiento Financiero
        </button>

      </form>
    </div>
  );
}

// ==========================================
// 2. COMPONENTE: GESTIÓN DE CLIENTES (FICHA MÉDICA COMPLETA Y LOYALTY)
// ==========================================
function GestionClientes({ clientes, agregarCliente, actualizarCliente }) {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  
  const [nivelCertificacion, setNivelCertificacion] = useState('Open Water');
  const [agenciaCertificacion, setAgenciaCertificacion] = useState('PADI');
  const [seguro, setSeguro] = useState('DAN Activo');
  const [idCertificacion, setIdCertificacion] = useState('');

  const [contactoEmergenciaNombre, setContactoEmergenciaNombre] = useState('');
  const [contactoEmergenciaTel, setContactoEmergenciaTel] = useState('');

  const [tipoSangre, setTipoSangre] = useState('O+');
  const [alergiasEnfermedades, setAlergiasEnfermedades] = useState('');
  const [loyalty, setLoyalty] = useState(false);

  const [editingClientId, setEditingClientId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [expandedClientId, setExpandedClientId] = useState(null);

  const iniciarEdicion = (cliente) => {
    setEditingClientId(cliente.id);
    setNombreCompleto(cliente.nombre_completo);
    setIdentificacion(cliente.identificacion || '');
    setTelefono(cliente.telefono);
    setCorreo(cliente.correo || '');
    setFechaNacimiento(cliente.fecha_nacimiento || '');
    setNivelCertificacion(cliente.nivel_certificacion);
    setAgenciaCertificacion(cliente.agencia_certificacion);
    setSeguro(cliente.seguro || 'DAN Activo');
    setIdCertificacion(cliente.id_certificacion || '');
    setContactoEmergenciaNombre(cliente.contacto_emergency_nombre || cliente.contacto_emergencia_nombre || '');
    setContactoEmergenciaTel(cliente.contacto_emergency_tel || cliente.contacto_emergencia_tel || '');
    setTipoSangre(cliente.tipo_sangre || 'O+');
    setAlergiasEnfermedades(cliente.alergias_enfermedades || '');
    setLoyalty(cliente.loyalty || false);
  };

  const cancelarEdicion = () => {
    setEditingClientId(null);
    setNombreCompleto('');
    setIdentificacion('');
    setTelefono('');
    setCorreo('');
    setFechaNacimiento('');
    setNivelCertificacion('Open Water');
    setAgenciaCertificacion('PADI');
    setSeguro('DAN Activo');
    setIdCertificacion('');
    setContactoEmergenciaNombre('');
    setContactoEmergenciaTel('');
    setTipoSangre('O+');
    setAlergiasEnfermedades('');
    setLoyalty(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombreCompleto || !telefono) return;

    const datosCliente = {
      nombre_completo: nombreCompleto,
      identificacion,
      telefono,
      correo,
      fecha_nacimiento: fechaNacimiento || null,
      nivel_certificacion: nivelCertificacion,
      agencia_certificacion: agenciaCertificacion,
      seguro,
      id_certificacion: idCertificacion,
      contacto_emergencia_nombre: contactoEmergenciaNombre,
      contacto_emergencia_tel: contactoEmergenciaTel,
      tipo_sangre: tipoSangre,
      alergias_enfermedades: alergiasEnfermedades,
      loyalty
    };

    if (editingClientId) {
      await actualizarCliente({ id: editingClientId, ...datosCliente });
      setMensajeExito('¡Expediente de buzo actualizado correctamente!');
      cancelarEdicion();
    } else {
      await agregarCliente(datosCliente);
      setMensajeExito('¡Nuevo buzo incorporado al expediente!');
      setNombreCompleto('');
      setIdentificacion('');
      setTelefono('');
      setCorreo('');
      setFechaNacimiento('');
      setIdCertificacion('');
      setContactoEmergenciaNombre('');
      setContactoEmergenciaTel('');
      setAlergiasEnfermedades('');
      setLoyalty(false);
    }

    setTimeout(() => setMensajeExito(''), 4000);
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.nivel_certificacion.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono.includes(busqueda)
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {mensajeExito && (
        <div className="bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl">
          <span className="text-xl">✓</span>
          <span className="font-bold text-sm tracking-wide">{mensajeExito}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/50 px-3 py-1.5 rounded-full border border-cyan-500/20">
            Comunidad & Seguridad
          </span>
          <h2 className="text-3xl font-black text-white mt-4">Gestión de Clientes</h2>
          <p className="text-sm text-slate-400">Control de perfiles de buceo, seguros médicos, registros de emergencia y membresías loyalty</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Columna Izquierda: Formulario Modular */}
        <div className="lg:col-span-4 bg-[#0b1528]/80 backdrop-blur-xl border border-cyan-500/15 rounded-3xl p-6 shadow-xl flex flex-col justify-between self-start">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex justify-between items-center">
              <span>{editingClientId ? '📝 Editar Buceador' : '👤 Nuevo Buceador'}</span>
              {editingClientId && (
                <button 
                  type="button" 
                  onClick={cancelarEdicion}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/30 px-2.5 py-1 rounded-lg"
                >
                  Cancelar
                </button>
              )}
            </h3>

            {/* SECCIÓN 1: DATOS PERSONALES */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase block border-b border-slate-800 pb-1">1. Datos de Identificación</span>
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  placeholder="Nombre Completo"
                  className="w-full bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={identificacion}
                    onChange={(e) => setIdentificacion(e.target.value)}
                    placeholder="Cédula / Pasaporte"
                    className="w-full bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                  />
                  <input
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    title="Fecha de Nacimiento"
                    className="w-full bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-400 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: CONTACTO */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase block border-b border-slate-800 pb-1">2. Información de Contacto</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Teléfono"
                  className="w-full bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                  required
                />
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Correo"
                  className="w-full bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* SECCIÓN 3: PERFIL DE BUCEO */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase block border-b border-slate-800 pb-1">3. Perfil del Buzo</span>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={agenciaCertificacion}
                  onChange={(e) => setAgenciaCertificacion(e.target.value)}
                  className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none"
                >
                  <option value="PADI">PADI</option>
                  <option value="SSI">SSI</option>
                  <option value="NAUI">NAUI</option>
                  <option value="CMAS">CMAS</option>
                </select>

                <select
                  value={seguro}
                  onChange={(e) => setSeguro(e.target.value)}
                  className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none"
                >
                  <option value="DAN Activo">DAN Activo</option>
                  <option value="Vencido">Vencido</option>
                </select>
              </div>

              <select
                value={nivelCertificacion}
                onChange={(e) => setNivelCertificacion(e.target.value)}
                className="w-full bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none mb-2"
              >
                <option value="Open Water">Open Water Diver</option>
                <option value="Advanced Open Water">Advanced Open Water</option>
                <option value="Rescue Diver">Rescue Diver</option>
                <option value="Divemaster">Divemaster</option>
                <option value="Instructor">Instructor de Buceo</option>
                <option value="En Curso">🎓 En Curso</option>
              </select>

              {/* CÓDIGO PIC PADI */}
              <div className="flex flex-col mt-2">
                <input
                  type="text"
                  value={idCertificacion}
                  onChange={(e) => setIdCertificacion(e.target.value)}
                  placeholder="Código Curso PADI / PIC (Opcional)"
                  className="w-full bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* SECCIÓN 4: SEGURIDAD MÉDICA */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase block border-b border-slate-800 pb-1">4. Registro Médico y Emergencia</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={contactoEmergenciaNombre}
                  onChange={(e) => setContactoEmergenciaNombre(e.target.value)}
                  placeholder="Contacto Emergencia"
                  className="w-full bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                />
                <input
                  type="text"
                  value={contactoEmergenciaTel}
                  onChange={(e) => setContactoEmergenciaTel(e.target.value)}
                  placeholder="Tel. Emergencia"
                  className="w-full bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <select
                    value={tipoSangre}
                    onChange={(e) => setTipoSangre(e.target.value)}
                    className="w-full bg-[#070e1b] border border-slate-700/60 rounded-xl px-2 py-2.5 text-white text-xs focus:outline-none"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={alergiasEnfermedades}
                    onChange={(e) => setAlergiasEnfermedades(e.target.value)}
                    placeholder="Alergias / Patologías"
                    className="w-full bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 5: MEMBRESÍA LOYALTY */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase block border-b border-slate-800 pb-1">5. Club de Fidelización</span>
              <button
                type="button"
                onClick={() => setLoyalty(!loyalty)}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-between border
                  ${loyalty 
                    ? 'bg-amber-950/40 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                    : 'bg-[#070e1b] border-slate-800 text-slate-500'}`}
              >
                <span>⭐ Miembro Loyalty Activo</span>
                <span>{loyalty ? 'SÍ' : 'NO'}</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md mt-2"
            >
              {editingClientId ? '💾 Actualizar Expediente' : '🚀 Registrar Buzo'}
            </button>
          </form>
        </div>

        {/* Columna Derecha: Buscador y Listado Premium */}
        <div className="lg:col-span-8 bg-[#0b1528]/80 backdrop-blur-xl border border-cyan-500/15 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-lg font-black text-white">🌊 Expediente de Buzos Inscritos</h3>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, teléfono o rango..."
              className="bg-[#070e1b] border border-slate-700/60 text-xs px-4 py-2 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 w-full sm:w-64"
            />
          </div>

          <div className="overflow-x-auto text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 tracking-wider">
                  <th className="py-3 px-3">Buceador</th>
                  <th className="py-3 px-3">Certificación</th>
                  <th className="py-3 px-3">Seguro Médico</th>
                  <th className="py-3 px-3">Contacto</th>
                  <th className="py-3 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500 text-xs">
                      No se encontraron buceadores registrados con ese criterio.
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map((c) => {
                    const isExpanded = expandedClientId === c.id;
                    const isEnCurso = c.nivel_certificacion === 'En Curso';
                    return (
                      <React.Fragment key={c.id}>
                        <tr className="hover:bg-slate-800/20 transition-all">
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-3">
                              <div className="font-bold text-white text-base leading-snug">{c.nombre_completo}</div>
                              {c.loyalty && (
                                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                                  ⭐ Loyalty
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-cyan-400 font-mono mt-0.5">ID: #{c.id}</div>
                          </td>
                          <td className="py-4 px-3">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap inline-block border
                              ${isEnCurso 
                                ? 'bg-amber-950/40 text-amber-400 border-amber-500/30 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                                : 'bg-cyan-950/60 text-cyan-400 border-cyan-500/25'}`}>
                              {c.agencia_certificacion} - {c.nivel_certificacion}
                            </span>
                          </td>
                          <td className="py-4 px-3">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider whitespace-nowrap inline-block
                              ${c.seguro === 'DAN Activo' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' : 'bg-rose-950/50 text-rose-400 border border-rose-500/20'}`}>
                              {c.seguro || 'DAN Activo'}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-slate-400 font-mono text-xs whitespace-nowrap">{c.telefono}</td>
                          <td className="py-4 px-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => setExpandedClientId(isExpanded ? null : c.id)}
                                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 whitespace-nowrap"
                              >
                                {isExpanded ? '👁️ Cerrar' : '👁️ Ficha'}
                              </button>
                              <button
                                onClick={() => iniciarEdicion(c)}
                                className="text-xs bg-cyan-950/40 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/30 text-cyan-400 px-2.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap"
                              >
                                ✏️ Editar
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Fila Expandida de Datos de Emergencia */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="5" className="bg-[#070e1b]/40 p-5 border-l-2 border-cyan-500">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
                                <div className="space-y-1.5">
                                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Identificación y Curso</p>
                                  <p>🪪 Documento: <span className="text-white font-semibold font-mono">{c.identificacion || 'No registrado'}</span></p>
                                  <p>✉️ Correo: <span className="text-white font-semibold font-mono">{c.correo || 'No registrado'}</span></p>
                                  <p>📅 Nacimiento: <span className="text-white font-semibold font-mono">{c.fecha_nacimiento || 'No registrado'}</span></p>
                                  {c.id_certificacion && (
                                    <div className="bg-cyan-950/40 border border-cyan-500/20 rounded-lg p-2 mt-2">
                                      <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider mb-0.5">🎓 Código Curso PADI (PIC):</p>
                                      <p className="text-[11px] text-cyan-300 font-mono font-bold">{c.id_certificacion}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-1.5">
                                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Contacto de Emergencia</p>
                                  <p>👤 Contacto: <span className="text-white font-semibold">{c.contacto_emergency_nombre || c.contacto_emergencia_nombre || 'No registrado'}</span></p>
                                  <p>📞 Teléfono: <span className="text-white font-semibold font-mono">{c.contacto_emergency_tel || c.contacto_emergencia_tel || 'No registrado'}</span></p>
                                </div>
                                <div className="space-y-1.5">
                                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Ficha Médica de Buceo</p>
                                  <p>🩸 Tipo de Sangre: <span className="bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded font-black">{c.tipo_sangre || 'O+'}</span></p>
                                  {c.alergias_enfermedades ? (
                                    <div className="bg-rose-950/30 border border-rose-500/30 rounded-lg p-2 mt-1">
                                      <p className="text-[9px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">⚠️ Alergias / Patologías:</p>
                                      <p className="text-[11px] text-rose-300 font-medium">{c.alergias_enfermedades}</p>
                                    </div>
                                  ) : (
                                    <p className="text-emerald-400 font-semibold flex items-center gap-1 mt-1">✓ Sin restricciones médicas registradas</p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// 3. COMPONENTE: GESTIÓN DE PROVEEDORES (LOGÍSTICA)
// ==========================================
function GestionProveedores({ proveedores, agregarProveedor, actualizarProveedor }) {
  const [nombreComercial, setNombreComercial] = useState('');
  const [tipoServicio, setTipoServicio] = useState('Transporte Marítimo / Bote');
  const [nitIdentificacion, setNitIdentificacion] = useState('');
  const [contactoNombre, setContactoNombre] = useState('');
  const [telefono, setTelefono] = useState('');

  const [editingProvId, setEditingProvId] = useState(null);
  const [mensajeExito, setMensajeExito] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const iniciarEdicion = (prov) => {
    setEditingProvId(prov.id);
    setNombreComercial(prov.nombre_comercial);
    setTipoServicio(prov.tipo_servicio);
    setNitIdentificacion(prov.nit_identificacion);
    setContactoNombre(prov.contacto_nombre);
    setTelefono(prov.telefono || '');
  };

  const cancelarEdicion = () => {
    setEditingProvId(null);
    setNombreComercial('');
    setTipoServicio('Transporte Marítimo / Bote');
    setNitIdentificacion('');
    setContactoNombre('');
    setTelefono('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombreComercial || !nitIdentificacion || !contactoNombre) return;

    const provData = {
      nombre_comercial: nombreComercial,
      tipo_servicio: tipoServicio,
      nit_identificacion: nitIdentificacion,
      contacto_nombre: contactoNombre,
      telefono
    };

    if (editingProvId) {
      await actualizarProveedor({ id: editingProvId, ...provData });
      setMensajeExito('¡Proveedor actualizado con éxito!');
      cancelarEdicion();
    } else {
      await agregarProveedor(provData);
      setMensajeExito('¡Aliado logístico agregado con éxito!');
      setNombreComercial('');
      setNitIdentificacion('');
      setContactoNombre('');
      setTelefono('');
    }

    setTimeout(() => setMensajeExito(''), 4000);
  };

  const proveedoresFiltrados = proveedores.filter(p =>
    p.nombre_comercial.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.tipo_servicio.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.contacto_nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {mensajeExito && (
        <div className="bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl">
          <span className="text-xl">✓</span>
          <span className="font-bold text-sm tracking-wide">{mensajeExito}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/50 px-3 py-1.5 rounded-full border border-cyan-500/20">
            Logística & Alianzas
          </span>
          <h2 className="text-3xl font-black text-white mt-4">Gestión de Proveedores</h2>
          <p className="text-sm text-slate-400">Administra tus convenios con botes, hospedajes y estaciones de carga de tanques</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de Registro / Edición */}
        <div className="bg-[#0b1528]/80 backdrop-blur-xl border border-cyan-500/15 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex justify-between items-center">
              <span>{editingProvId ? '📝 Editar Aliado' : '🏢 Nuevo Proveedor'}</span>
              {editingProvId && (
                <button 
                  type="button" 
                  onClick={cancelarEdicion}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/30 px-2.5 py-1 rounded-lg"
                >
                  Cancelar
                </button>
              )}
            </h3>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Razón Social / Nombre Comercial</label>
              <input
                type="text"
                value={nombreComercial}
                onChange={(e) => setNombreComercial(e.target.value)}
                placeholder="Ej: Coiba Express Marítima"
                className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">NIT / Identificación Fiscal</label>
              <input
                type="text"
                value={nitIdentificacion}
                onChange={(e) => setNitIdentificacion(e.target.value)}
                placeholder="NIT 900.123.456-1"
                className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Tipo de Servicio</label>
              <select
                value={tipoServicio}
                onChange={(e) => setTipoServicio(e.target.value)}
                className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none"
              >
                <option value="Transporte Marítimo / Bote">Transporte Marítimo / Bote</option>
                <option value="Hospedaje e Instalaciones">Hospedaje e Instalaciones</option>
                <option value="Carga de Gases (Aire/Nitrox)">Carga de Gases (Aire/Nitrox)</option>
                <option value="Seguros / Logística">Seguros / Logística de Viaje</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Contacto Principal</label>
                <input
                  type="text"
                  value={contactoNombre}
                  onChange={(e) => setContactoNombre(e.target.value)}
                  placeholder="Ej: Cap. Juan"
                  className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+57 300 123..."
                  className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md mt-2"
            >
              {editingProvId ? '💾 Guardar Cambios' : '🚀 Registrar Proveedor'}
            </button>
          </form>
        </div>

        {/* Listado de Tarjetas */}
        <div className="lg:col-span-2 bg-[#0b1528]/80 backdrop-blur-xl border border-cyan-500/15 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-lg font-black text-white">🌊 Aliados Estratégicos</h3>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por servicio o empresa..."
              className="bg-[#070e1b] border border-slate-700/60 text-xs px-4 py-2 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 w-full sm:w-64"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {proveedoresFiltrados.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-slate-500 text-xs">
                No hay proveedores registrados con ese criterio.
              </div>
            ) : (
              proveedoresFiltrados.map((p) => (
                <div key={p.id} className="bg-[#0e192c]/75 border border-slate-700/60 rounded-2xl p-5 hover:border-cyan-500/30 transition-all flex flex-col justify-between relative group">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-black text-cyan-400 block mb-1">{p.tipo_servicio}</span>
                    <h4 className="text-base font-black text-white mb-2 leading-tight">{p.nombre_comercial}</h4>
                    
                    <div className="space-y-1 text-xs text-slate-400">
                      <p className="font-mono text-[10px] text-slate-500">📍 {p.nit_identificacion}</p>
                      <p>👤 Contacto: <span className="font-semibold text-slate-300">{p.contacto_nombre}</span></p>
                      {p.telefono && <p>📞 Tel: <span className="font-mono text-slate-400">{p.telefono}</span></p>}
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 mt-4 pt-3 flex justify-end">
                    <button
                      onClick={() => iniciarEdicion(p)}
                      className="text-xs bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 border border-slate-700/80 px-3 py-1.5 rounded-xl font-bold transition-all"
                    >
                      ✏️ Editar Aliado
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// 4. COMPONENTE: GESTIÓN DE VIAJES (INTEGRACIÓN CON FECHAS DE SUPABASE)
// ==========================================
function GestionViajes({ viajes, clientes, transacciones, agregarViaje, actualizarViaje }) {
  const [destino, setDestino] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [fechaRegreso, setFechaRegreso] = useState('');
  const [precioBase, setPrecioBase] = useState('');
  const [divisaBase, setDivisaBase] = useState('USD');
  const [cuposMaximos, setCuposMaximos] = useState('12');
  
  const [editingTripId, setEditingTripId] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const [viajeIdSeleccionado, setViajeIdSeleccionado] = useState(1);
  const [pestañaContable, setPestañaContable] = useState('buzos');

  const iniciarEdicion = (viaje) => {
    setEditingTripId(viaje.id);
    setDestino(viaje.destino);
    setFechaSalida(viaje.fecha_salida);
    setFechaRegreso(viaje.fecha_regreso);
    setPrecioBase(viaje.precio_base.toString());
    setDivisaBase(viaje.divisa_base);
    setCuposMaximos(viaje.cupos_maximos.toString());
    setValidationError('');
  };

  const cancelarEdicion = () => {
    setEditingTripId(null);
    setDestino('');
    setFechaSalida('');
    setFechaRegreso('');
    setPrecioBase('');
    setDivisaBase('USD');
    setCuposMaximos('12');
    setValidationError('');
  };

  const handleCrearOEditarViaje = async (e) => {
    e.preventDefault();
    if (!destino || !precioBase || !fechaSalida || !fechaRegreso || !cuposMaximos) return;

    const parsedCupos = parseInt(cuposMaximos);

    if (editingTripId) {
      const viajeOriginal = viajes.find(v => v.id === editingTripId);
      if (parsedCupos < viajeOriginal.cupos_maximos) {
        setValidationError(`El cupo total de este viaje no puede ser menor al actual (${viajeOriginal.cupos_maximos} cupos) para evitar sobrecupos de reservas.`);
        return;
      }

      const viajeActualizado = {
        destino,
        fecha_salida: fechaSalida,
        fecha_regreso: fechaRegreso,
        precio_base: parseFloat(precioBase),
        divisa_base: divisaBase,
        cupos_maximos: parsedCupos
      };

      await actualizarViaje({ id: editingTripId, ...viajeActualizado });
      setSuccessBanner('¡Viaje actualizado con éxito!');
      cancelarEdicion();
    } else {
      const nuevo = {
        destino,
        fecha_salida: fechaSalida,
        fecha_regreso: fechaRegreso,
        precio_base: parseFloat(precioBase),
        divisa_base: divisaBase,
        cupos_maximos: parsedCupos
      };

      await agregarViaje(nuevo);
      setSuccessBanner('¡Nueva expedición lanzada al mercado!');
      setDestino('');
      setFechaSalida('');
      setFechaRegreso('');
      setPrecioBase('');
    }

    setTimeout(() => setSuccessBanner(''), 4000);
  };

  const viajeSeleccionado = viajes.find(v => v.id === parseInt(viajeIdSeleccionado)) || viajes[0];
  const transaccionesDelViaje = transacciones.filter(t => t.viaje_id === viajeSeleccionado?.id);

  const ingresosCop = transaccionesDelViaje
    .filter(t => t.tipo === 'Ingreso')
    .reduce((sum, t) => sum + t.monto_cop, 0);

  const salidasCop = transaccionesDelViaje
    .filter(t => t.tipo === 'Salida')
    .reduce((sum, t) => sum + t.monto_cop, 0);

  const saldoNetoCop = ingresosCop - salidasCop;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {successBanner && (
        <div className="bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl">
          <span className="text-xl">✓</span>
          <span className="font-bold text-sm tracking-wide">{successBanner}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/50 px-3 py-1.5 rounded-full border border-cyan-500/20">
            Logística & Finanzas
          </span>
          <h2 className="text-3xl font-black text-white mt-4">Expediciones de Buceo</h2>
          <p className="text-sm text-slate-400">Control de ingresos, gastos y estados de pago de clientes por destino</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario */}
        <div className="bg-[#0b1528]/80 backdrop-blur-xl border border-cyan-500/15 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <form onSubmit={handleCrearOEditarViaje} className="space-y-4">
            <h3 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex justify-between items-center">
              <span>{editingTripId ? '✏️ Editar Expedición' : '🗺️ Nueva Expedición'}</span>
              {editingTripId && (
                <button 
                  type="button" 
                  onClick={cancelarEdicion}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/30 px-2.5 py-1 rounded-lg"
                >
                  Cancelar
                </button>
              )}
            </h3>

            {validationError && (
              <div className="bg-rose-950/80 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs font-medium">
                ⚠️ {validationError}
              </div>
            )}
            
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Destino / Nombre del Viaje</label>
              <input
                type="text"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Ej: Coiba, Panamá - Avistamiento"
                className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Fecha Salida</label>
                <input
                  type="date"
                  value={fechaSalida}
                  onChange={(e) => setFechaSalida(e.target.value)}
                  className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-400 text-xs focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Fecha Regreso</label>
                <input
                  type="date"
                  value={fechaRegreso}
                  onChange={(e) => setFechaRegreso(e.target.value)}
                  className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-400 text-xs focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Precio Base</label>
                <input
                  type="number"
                  value={precioBase}
                  onChange={(e) => setPrecioBase(e.target.value)}
                  placeholder="3500"
                  className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Divisa Base</label>
                <select
                  value={divisaBase}
                  onChange={(e) => setDivisaBase(e.target.value)}
                  className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="COP">COP</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Cupos Máximos</label>
              <input
                type="number"
                value={cuposMaximos}
                onChange={(e) => setCuposMaximos(e.target.value)}
                placeholder="12"
                className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md mt-2"
            >
              {editingTripId ? '💾 Actualizar Viaje' : '🚀 Lanzar Destino'}
            </button>
          </form>
        </div>

        {/* Tarjetas rápidas */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-black text-white">🌊 Expediciones Activas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {viajes.map((v) => {
              const transDeEsteViaje = transacciones.filter(t => t.viaje_id === v.id);
              const ingresos = transDeEsteViaje.filter(t => t.tipo === 'Ingreso').reduce((sum, t) => sum + t.monto_cop, 0);
              
              return (
                <div
                  key={v.id}
                  className={`p-5 rounded-2xl border transition-all duration-300 relative group
                    ${viajeIdSeleccionado === v.id 
                      ? 'bg-[#0c2c47]/80 border-cyan-500/50 shadow-[0_10px_30px_rgba(6,182,212,0.15)]' 
                      : 'bg-[#0b1528]/60 border-slate-700/60 hover:border-slate-500'}`}
                >
                  <div className="absolute inset-0 cursor-pointer" onClick={() => setViajeIdSeleccionado(v.id)}></div>
                  
                  <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        iniciarEdicion(v);
                      }}
                      className="bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-400 p-2 rounded-xl text-xs transition-colors font-bold"
                      title="Editar Expedición"
                    >
                      ✏️ Editar
                    </button>
                  </div>

                  <div className="flex justify-between items-start mb-2 pr-16">
                    <span className="text-[10px] font-black uppercase text-cyan-400">{v.fecha_salida}</span>
                    <span className="text-xs font-mono text-slate-400 font-bold">{v.precio_base.toLocaleString()} {v.divisa_base}</span>
                  </div>
                  <h4 className="text-base font-black text-white leading-tight mb-4 pr-16">{v.destino}</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                      <span>RECAUDO EN CAJA</span>
                      <span className="text-white">$ {ingresos.toLocaleString()} COP</span>
                    </div>
                    <div className="w-full bg-[#070e1b] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5" style={{ width: `${Math.min((ingresos / 50000000) * 100, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>LÍMITE DE CUPOS</span>
                      <span>{v.cupos_maximos} BUZOS</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Ledger del Viaje */}
      <div className="bg-[#0b1528]/70 border border-slate-700/60 rounded-3xl p-4 sm:p-8 shadow-2xl">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-800 pb-6 mb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Viaje Seleccionado para Auditoría:</span>
            <h3 className="text-2xl font-black text-white mt-1">🌊 {viajeSeleccionado?.destino}</h3>
            <p className="text-xs text-slate-400 mt-1">Fechas: del {viajeSeleccionado?.fecha_salida} al {viajeSeleccionado?.fecha_regreso} | Valor Base: {viajeSeleccionado?.precio_base} {viajeSeleccionado?.divisa_base} | Cupo total: {viajeSeleccionado?.cupos_maximos} buceadores</p>
          </div>

          <div className="bg-[#070e1b] border border-cyan-500/20 px-6 py-4 rounded-2xl text-left lg:text-right w-full lg:w-auto">
            <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400 block mb-1">Utilidad de Caja (COP)</span>
            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white block">$ {saldoNetoCop.toLocaleString()}</span>
            <div className="text-[10px] text-slate-500 mt-1">
              Ingresos: ${ingresosCop.toLocaleString()} | Gastos: ${salidasCop.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6 border-b border-slate-800/60 pb-3 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setPestañaContable('buzos')}
            className={`text-xs font-black uppercase tracking-wider pb-2 border-b-2 transition-all
              ${pestañaContable === 'buzos' ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
          >
            👥 Saldos de Buzos
          </button>
          <button
            onClick={() => setPestañaContable('historial')}
            className={`text-xs font-black uppercase tracking-wider pb-2 border-b-2 transition-all
              ${pestañaContable === 'historial' ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
          >
            📖 Historial Contable del Viaje
          </button>
        </div>

        {pestañaContable === 'buzos' && (
          <div className="overflow-x-auto text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 tracking-wider">
                  <th className="py-3 px-2">Buceador</th>
                  <th className="py-3 px-2">Precio Base Viaje</th>
                  <th className="py-3 px-2">Total Abonado (COP eq)</th>
                  <th className="py-3 px-2">Estado de Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {clientes.map((c) => {
                  const abonosBuzo = transaccionesDelViaje
                    .filter(t => t.tipo === 'Ingreso' && t.cliente_id === c.id)
                    .reduce((sum, t) => sum + t.monto_cop, 0);

                  const precioEnPesosEst = viajeSeleccionado?.divisa_base === 'USD' ? viajeSeleccionado.precio_base * 4000 : viajeSeleccionado?.precio_base || 0;
                  const saldoPending = Math.max(precioEnPesosEst - abonosBuzo, 0);

                  return (
                    <tr key={c.id} className="hover:bg-slate-800/10">
                      <td className="py-4 px-2">
                        <div className="font-bold text-white text-base">
                          {c.nombre_completo} {c.loyalty && '⭐'}
                        </div>
                        <div className="text-[10px] text-cyan-400 font-mono">{c.nivel_certificacion}</div>
                      </td>
                      <td className="py-4 px-2 font-mono text-slate-300 font-semibold">
                        {viajeSeleccionado?.precio_base} {viajeSeleccionado?.divisa_base}
                      </td>
                      <td className="py-4 px-2">
                        <div className="font-black text-white font-mono">$ {abonosBuzo.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500">Saldo Pendiente est: ${saldoPending.toLocaleString()} COP</div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider inline-block
                          ${abonosBuzo >= precioEnPesosEst 
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' 
                            : abonosBuzo > 0 
                              ? 'bg-amber-950/50 text-amber-400 border border-amber-500/20' 
                              : 'bg-rose-950/50 text-rose-400 border border-rose-500/20'}`}>
                          {abonosBuzo >= precioEnPesosEst ? 'Saldado' : abonosBuzo > 0 ? 'Abonando' : 'Sin Abono'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pestañaContable === 'historial' && (
          <div className="overflow-x-auto text-sm">
            {transaccionesDelViaje.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No hay ingresos ni salidas financieras registradas para este viaje aún.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 tracking-wider">
                    <th className="py-3 px-2">Fecha</th>
                    <th className="py-3 px-2">Tipo</th>
                    <th className="py-3 px-2">Monto Transacción</th>
                    <th className="py-3 px-2">Equivalencia COP</th>
                    <th className="py-3 px-2">Detalles / Cuenta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {transaccionesDelViaje.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/10">
                      <td className="py-4 px-2 text-slate-400 font-mono text-xs">{t.fecha_registro?.split('T')[0]}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider inline-block
                          ${t.tipo === 'Ingreso' 
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-950/60 text-rose-400 border border-rose-500/20'}`}>
                          {t.tipo}
                        </span>
                      </td>
                      <td className="py-4 px-2 font-mono font-bold text-white">{t.monto_original} {t.moneda_original}</td>
                      <td className="py-4 px-2 font-mono text-slate-300 font-black">$ {t.monto_cop?.toLocaleString()}</td>
                      <td className="py-4 px-2 text-xs">
                        <div className="text-slate-200 font-semibold">{t.descripcion}</div>
                        <div className="text-[10px] text-slate-500">{t.cuenta_origen_destino}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ==========================================
// 5. COMPONENTE: GESTIÓN DE RESERVAS (COMPONENTE NUEVO)
// ==========================================
function GestionReservas({ reservas, viajes, clientes, transacciones, agregarReserva, eliminarReserva }) {
  const [clienteId, setClienteId] = useState('');
  const [viajeId, setViajeId] = useState('');
  const [precioPactado, setPrecioPactado] = useState('');
  const [precioBase, setPrecioBase] = useState('');
  const [vistaInterna, setVistaInterna] = useState('manifiesto'); // 'manifiesto' o 'pasaporte'
  const [viajeSeleccionadoId, setViajeSeleccionadoId] = useState('');
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  
  const [busquedaBuzoPasaporte, setBusquedaBuzoPasaporte] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Sincronizar el precio pactado sugerido al seleccionar el viaje
  useEffect(() => {
    if (viajeId) {
      const v = viajes.find(item => item.id === parseInt(viajeId));
      if (v) {
        setPrecioBase(v.precio_base.toString());
        setPrecioPactado(v.precio_base.toString());
      }
    } else {
      setPrecioPactado('');
    }
  }, [viajeId, viajes]);

  // Sincronizar selectores iniciales
  useEffect(() => {
    if (viajes.length > 0 && !viajeSeleccionadoId) {
      setViajeSeleccionadoId(viajes[0].id.toString());
    }
    if (clientes.length > 0 && !clienteSeleccionadoId) {
      setClienteSeleccionadoId(clientes[0].id.toString());
    }
  }, [viajes, clientes]);

  // Cálculo reactivo de cupos tomados para un viaje
  const obtenerCuposDisponibles = (viaje) => {
    if (!viaje) return 0;
    const reservasActivas = reservas.filter(r => r.viaje_id === viaje.id && r.estado_reserva !== 'Cancelado');
    return Math.max(viaje.cupos_maximos - reservasActivas.length, 0);
  };

  const handleCrearReserva = async (e) => {
    e.preventDefault();
    if (!clienteId || !viajeId || !precioPactado) return;

    const viajeElegido = viajes.find(v => v.id === parseInt(viajeId));
    if (obtenerCuposDisponibles(viajeElegido) <= 0) {
      alert("Lo sentimos, no quedan cupos disponibles para esta expedición.");
      return;
    }

    const nuevaReserva = {
      cliente_id: parseInt(clienteId),
      viaje_id: parseInt(viajeId),
      precio_pactado_total: parseFloat(precioPactado),
      estado_reserva: 'Pendiente' // Se calcula reactivamente según abonos
    };

    await agregarReserva(nuevaReserva);
    setMensajeExito('🎫 ¡Buzo inscrito exitosamente a la expedición!');
    setClienteId('');
    setViajeId('');
    setPrecioPactado('');
    setTimeout(() => setMensajeExito(''), 4000);
  };

  // Filtrado de manifiesto de embarque para el viaje seleccionado
  const viajeSeleccionado = viajes.find(v => v.id === parseInt(viajeSeleccionadoId));
  const reservasDeEsteViaje = reservas.filter(r => r.viaje_id === parseInt(viajeSeleccionadoId));

  // Filtrado de pasaporte para el buceador seleccionado
  const clientePasaporte = clientes.find(c => c.id === parseInt(clienteSeleccionadoId));
  const reservasDeEsteCliente = reservas.filter(r => r.cliente_id === parseInt(clienteSeleccionadoId));

  return (
    <div className="space-y-8 animate-fade-in">
      
      {mensajeExito && (
        <div className="bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl">
          <span className="text-xl">✓</span>
          <span className="font-bold text-sm tracking-wide">{mensajeExito}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/50 px-3 py-1.5 rounded-full border border-cyan-500/20">
            Logística & Manifiesto
          </span>
          <h2 className="text-3xl font-black text-white mt-4">Gestión de Reservas</h2>
          <p className="text-sm text-slate-400">Vincula buzos a expediciones de forma dinámica, controla cupos de botes y monitorea saldos cruzados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Formulario de Nueva Inscripción */}
        <div className="lg:col-span-4 bg-[#0b1528]/80 backdrop-blur-xl border border-cyan-500/15 rounded-3xl p-6 shadow-xl flex flex-col justify-between self-start">
          <form onSubmit={handleCrearReserva} className="space-y-5">
            <h3 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <span>🎫 Inscribir en Viaje</span>
            </h3>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">1. Seleccionar Buceador</label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                required
              >
                <option value="">-- Elige un Buceador --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre_completo} {c.loyalty ? '⭐' : ''}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">2. Destino / Expedición</label>
              <select
                value={viajeId}
                onChange={(e) => setViajeId(e.target.value)}
                className="bg-[#070e1b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                required
              >
                <option value="">-- Elige un destino --</option>
                {viajes.map(v => {
                  const disponibles = obtenerCuposDisponibles(v);
                  return (
                    <option key={v.id} value={v.id} disabled={disponibles <= 0}>
                      {v.destino} ({disponibles} cupos libres de {v.cupos_maximos})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">3. Precio Pactado Total</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-cyan-400 font-mono">$</span>
                <input
                  type="number"
                  value={precioPactado}
                  onChange={(e) => setPrecioPactado(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#070e1b] border border-slate-700/60 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono text-xs focus:outline-none"
                  required
                />
              </div>
              {viajeId && (
                <span className="text-[9px] text-slate-500 mt-1 block">Precio de lista base: ${parseFloat(precioBase).toLocaleString()} USD/COP</span>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md mt-2"
            >
              Confirmar Inscripción
            </button>
          </form>
        </div>

        {/* Panel de Visualización Híbrido */}
        <div className="lg:col-span-8 bg-[#0b1528]/80 backdrop-blur-xl border border-cyan-500/15 rounded-3xl p-6 shadow-xl space-y-6">
          
          {/* Selector de Pestañas Híbridas */}
          <div className="flex border-b border-slate-800 pb-1 gap-2 overflow-x-auto whitespace-nowrap">
            <button
              type="button"
              onClick={() => setVistaInterna('manifiesto')}
              className={`pb-3 px-4 text-sm font-bold transition-all relative
                ${vistaInterna === 'manifiesto' 
                  ? 'text-cyan-400 border-b-2 border-cyan-400' 
                  : 'text-slate-400 hover:text-slate-200'}`}
            >
              📋 Manifiesto por Expedición
            </button>
            <button
              type="button"
              onClick={() => setVistaInterna('pasaporte')}
              className={`pb-3 px-4 text-sm font-bold transition-all relative
                ${vistaInterna === 'pasaporte' 
                  ? 'text-cyan-400 border-b-2 border-cyan-400' 
                  : 'text-slate-400 hover:text-slate-200'}`}
            >
              ✈️ Pasaporte de Reservas (Vista de Buzo)
            </button>
          </div>

          {/* VISTA 1: MANIFIESTO DE EMBARQUE */}
          {vistaInterna === 'manifiesto' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#070e1b]/40 p-4 rounded-2xl border border-slate-800">
                <div className="flex flex-col w-full sm:w-auto">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Filtrar por Expedición</span>
                  <select
                    value={viajeSeleccionadoId}
                    onChange={(e) => setViajeSeleccionadoId(e.target.value)}
                    className="bg-[#070e1b] border-none text-base font-black text-white focus:outline-none mt-1 p-0 cursor-pointer w-full"
                  >
                    {viajes.map((v) => (
                      <option key={v.id} value={v.id}>{v.destino} ({v.fecha_salida})</option>
                    ))}
                  </select>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-black text-slate-500 block">CUPOS ASIGNADOS</span>
                  <span className="text-xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                    {viajeSeleccionado ? reservas.filter(r => r.viaje_id === viajeSeleccionado.id && r.estado_reserva !== 'Cancelado').length : 0} / {viajeSeleccionado?.cupos_maximos || 12}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 uppercase text-[9px] font-bold border-b border-slate-800 tracking-wider">
                      <th className="py-3 px-3">Buceador</th>
                      <th className="py-3 px-3">Precio Pactado</th>
                      <th className="py-3 px-3">Pagado en Caja</th>
                      <th className="py-3 px-3">Saldo Pendiente</th>
                      <th className="py-3 px-3 text-center">Estado Auto</th>
                      <th className="py-3 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {clientes.filter(c => reservas.some(r => r.cliente_id === c.id && r.viaje_id === viajeSeleccionado?.id)).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-500 text-xs">
                          No hay buceadores registrados en esta expedición todavía.
                        </td>
                      </tr>
                    ) : (
                      clientes.map((c) => {
                        const reserva = reservas.find(r => r.viaje_id === viajeSeleccionado?.id && r.cliente_id === c.id);
                        if (!reserva) return null;

                        // Calcular abonos reales del buzo para este viaje
                        const abonosBuzo = transacciones
                          .filter(t => t.tipo === 'Ingreso' && t.viaje_id === viajeSeleccionado.id && t.cliente_id === c.id)
                          .reduce((sum, t) => sum + (t.monto_original || 0), 0); // en divisa base

                        const precioPactado = reserva.precio_pactado_total;
                        const esCancelada = reserva.estado_reserva === 'Cancelado';
                        
                        let estadoCalculado = 'Pendiente';
                        if (esCancelada) {
                          estadoCalculado = 'Cancelado';
                        } else if (abonosBuzo >= precioPactado) {
                          estadoCalculado = 'Saldado';
                        } else if (abonosBuzo > 0) {
                          estadoCalculado = 'Abonado';
                        }
                        
                        const saldoPendiente = Math.max(precioPactado - abonosBuzo, 0);

                        return (
                          <tr key={c.id} className="hover:bg-slate-800/20 transition-all">
                            <td className="py-4 px-3">
                              <div className="font-bold text-white">{c.nombre_completo}</div>
                              <div className="text-[10px] text-slate-500">{c.nivel_certificacion} ({c.agencia_certificacion})</div>
                            </td>
                            <td className="py-4 px-3 font-mono font-bold text-slate-300">
                              $ {precioPactado.toLocaleString()} {viajeSeleccionado?.divisa_base}
                            </td>
                            <td className="py-4 px-3 font-mono text-emerald-400 font-bold">
                              $ {abonosBuzo.toLocaleString()}
                            </td>
                            <td className="py-4 px-3 font-mono text-rose-400">
                              $ {saldoPendiente.toLocaleString()}
                            </td>
                            <td className="py-4 px-3 text-center">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider inline-block
                                ${estadoCalculado === 'Saldado' 
                                  ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' 
                                  : estadoCalculado === 'Abonado' 
                                    ? 'bg-amber-950/50 text-amber-400 border border-amber-500/20' 
                                    : estadoCalculado === 'Cancelado'
                                      ? 'bg-rose-950/50 text-rose-400 border border-rose-500/20'
                                      : 'bg-slate-950/50 text-slate-400 border border-slate-800'}`}>
                                {estadoCalculado}
                              </span>
                            </td>
                            <td className="py-4 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => eliminarReserva(reserva.id)}
                                className="text-[11px] font-bold text-rose-400 bg-rose-950/20 border border-rose-500/30 px-3 py-1.5 rounded-xl hover:bg-rose-500 hover:text-slate-950 transition-colors"
                              >
                                Cancelar
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA 2: PASAPORTE UNIFICADO DE RESERVAS */}
          {vistaInterna === 'pasaporte' && (
            <div className="bg-[#0b1528]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-xl space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-black text-white">💳 Pasaporte Unificado de Reservas</h3>
                <p className="text-xs text-slate-400 mt-1">Busca un buceador para consultar de un vistazo todos sus destinos agendados y balances consolidados:</p>
              </div>

              {/* Buscador inteligente con dropdown flotante (Opción B) */}
              <div className="relative">
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">🔍 Buscar Buceador por Nombre Completo</label>
                <div className="relative">
                  <input
                    type="text"
                    value={busquedaBuzoPasaporte}
                    onChange={(e) => {
                      setBusquedaBuzoPasaporte(e.target.value);
                      setMostrarSugerencias(true);
                    }}
                    onFocus={() => setMostrarSugerencias(true)}
                    placeholder="Escribe el nombre completo del buzo..."
                    className="w-full bg-[#070e1b] border border-slate-700/60 rounded-xl pl-4 pr-24 py-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  
                  {/* Botón de limpiar unificado */}
                  {busquedaBuzoPasaporte && (
                    <button
                      type="button"
                      onClick={() => {
                        setBusquedaBuzoPasaporte('');
                        setClienteSeleccionadoId('');
                        setMostrarSugerencias(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-400 bg-rose-950/40 border border-rose-500/25 px-2.5 py-1 rounded-md hover:bg-rose-500 hover:text-slate-950 transition-all"
                    >
                      ✕ Limpiar
                    </button>
                  )}
                </div>

                {/* Dropdown de Sugerencias Flotantes */}
                {mostrarSugerencias && busquedaBuzoPasaporte && (
                  <div className="absolute left-0 right-0 mt-2 bg-[#0b1528] border border-cyan-500/20 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800/60 backdrop-blur-xl">
                    {(() => {
                      const filtrados = clientes.filter(c => 
                        c.nombre_completo.toLowerCase().includes(busquedaBuzoPasaporte.toLowerCase())
                      );
                      
                      if (filtrados.length === 0) {
                        return (
                          <div className="p-4 text-xs text-rose-400 font-bold tracking-wide animate-pulse">
                            ⚠️ Cliente no encontrado, valida el nombre
                          </div>
                        );
                      }
                      
                      return filtrados.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setClienteSeleccionadoId(c.id.toString());
                            setBusquedaBuzoPasaporte(c.nombre_completo);
                            setMostrarSugerencias(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-cyan-950/40 text-xs text-slate-200 transition-colors flex justify-between items-center"
                        >
                          <div>
                            <span className="font-bold text-white block">{c.nombre_completo}</span>
                            <span className="text-[10px] text-slate-500">{c.nivel_certificacion}</span>
                          </div>
                          <span className="bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                            {c.agencia_certificacion}
                          </span>
                        </button>
                      ));
                    })()}
                  </div>
                )}
              </div>

              {/* Panel de resultados (Pasaporte enfocado en ancho completo para mayor comodidad) */}
              <div className="pt-2">
                {clienteSeleccionadoId ? (() => {
                  const buzo = clientes.find(c => c.id === parseInt(clienteSeleccionadoId));
                  const reservasBuzo = reservas.filter(r => r.cliente_id === parseInt(clienteSeleccionadoId));

                  return (
                    <div className="space-y-5 animate-fade-in">
                      <div className="bg-[#070e1b]/40 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Expedientes de Buceo</span>
                          <h4 className="text-xl font-black text-white mt-1">{buzo?.nombre_completo}</h4>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">{buzo?.agencia_certificacion} - {buzo?.nivel_certificacion} | {buzo?.correo || 'Sin correo registrado'}</span>
                        </div>
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3.5 py-1.5 rounded-xl text-xs font-black self-start sm:self-center">
                          {reservasBuzo.length} Expediciones Agendadas
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reservasBuzo.length === 0 ? (
                          <div className="col-span-2 text-center py-12 bg-[#070e1b]/20 border border-dashed border-slate-800 rounded-2xl">
                            <p className="text-slate-500 text-xs font-semibold">Este buceador no se encuentra inscrito en ninguna expedición activa actualmente.</p>
                          </div>
                        ) : (
                          reservasBuzo.map(r => {
                            const v = viajes.find(viaje => viaje.id === r.viaje_id);
                            
                            // Calcular abonos reales del buzo para este viaje
                            const abonosBuzo = transacciones
                              .filter(t => t.tipo === 'Ingreso' && t.viaje_id === v?.id && t.cliente_id === buzo.id)
                              .reduce((sum, t) => sum + (t.monto_original || 0), 0);
                            
                            const precioPactado = r.precio_pactado_total;
                            const porcentajePagado = Math.min((abonosBuzo / precioPactado) * 100, 100);

                            return (
                              <div key={r.id} className="bg-[#0e192c]/75 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-cyan-500/25 transition-all">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-[9px] uppercase tracking-widest font-black text-cyan-400 block">{v?.fecha_salida}</span>
                                    <h5 className="text-sm font-black text-white mt-1 leading-snug">{v?.destino}</h5>
                                  </div>
                                  <span className={`px-2.5 py-1 rounded-md font-black text-[9px] uppercase tracking-wider inline-block
                                    ${abonosBuzo >= precioPactado 
                                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20' 
                                      : abonosBuzo > 0 
                                        ? 'bg-amber-950/60 text-amber-400 border border-emerald-500/20' 
                                        : 'bg-rose-950/60 text-rose-400 border border-rose-500/20'}`}>
                                    {abonosBuzo >= precioPactado ? 'Saldado' : abonosBuzo > 0 ? 'Abonando' : 'Pendiente'}
                                  </span>
                                </div>

                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                    <span>PROGRESO DE PAGO</span>
                                    <span className="text-white font-mono">$ {abonosBuzo.toLocaleString()} / $ {precioPactado.toLocaleString()} {v?.divisa_base}</span>
                                  </div>
                                  <div className="w-full bg-[#070e1b] h-2 rounded-full overflow-hidden">
                                    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2" style={{ width: `${porcentajePagado}%` }}></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })() : (
                  <div className="text-center py-16 text-slate-500 text-xs bg-[#070e1b]/10 rounded-2xl border border-dashed border-slate-800/80">
                    🔍 Utiliza el buscador superior para encontrar un buceador y desplegar de inmediato su pasaporte unificado.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

// ==========================================
// 6. COMPONENTE PRINCIPAL: APP DE DIVE ACADEMY
// ==========================================
export default function App() {
  const [vistaActual, setVistaActual] = useState('resumen');
  const [conectadoSupabase, setConectadoSupabase] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [intentandoSeed, setIntentandoSeed] = useState(false);
  const [mensajeSeed, setMensajeSeed] = useState('');
  
  // Estado para controlar el colapso del menú lateral en móviles
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Base de Datos Global Unificada en Estado (Uplifted State)
  const [viajes, setViajes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [reservas, setReservas] = useState([]);

  // Función para re-consultar todos los datos desde Supabase
  const recargarDatosDesdeSupabase = async () => {
    try {
      const client = getSupabase();
      if (!client) {
        throw new Error("Cliente de Supabase no cargado aún.");
      }

      const { data: dataViajes, error: errorViajes } = await client
        .from('viajes')
        .select('*')
        .order('id', { ascending: true });
      
      const { data: dataClientes, error: errorClientes } = await client
        .from('clientes')
        .select('*')
        .order('id', { ascending: true });

      const { data: dataProveedores, error: errorProveedores } = await client
        .from('proveedores')
        .select('*')
        .order('id', { ascending: true });

      const { data: dataTransacciones, error: errorTransacciones } = await client
        .from('transacciones')
        .select('*')
        .order('id', { ascending: false });

      const { data: dataReservas, error: errorReservas } = await client
        .from('reservas')
        .select('*')
        .order('id', { ascending: true });

      if (errorViajes || errorClientes || errorProveedores || errorTransacciones || errorReservas) {
        throw new Error("No se pudo leer las tablas. Es muy probable que RLS esté bloqueando el acceso anónimo.");
      }

      setViajes(dataViajes || []);
      setClientes(dataClientes || []);
      setProveedores(dataProveedores || []);
      setTransacciones(dataTransacciones || []);
      setReservas(dataReservas || []);
      setConectadoSupabase(true);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Efecto principal para sincronizar en tiempo real con Supabase
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setCargando(true);
        const exito = await recargarDatosDesdeSupabase();
        if (!isMounted) return;
        if (!exito) {
          throw new Error("Acceso RLS restringido o sin conexión.");
        }
      } catch (e) {
        console.warn("Utilizando datos locales/demostración debido a:", e.message);
        if (isMounted) {
          setConectadoSupabase(false);
          
          // Inicialización Local/Semilla de Respaldo por si hay desconexión o RLS activado
          setViajes([
            { id: 1, destino: 'Malpelo, Colombia - Tiburón Martillo', fecha_salida: '2026-07-01', fecha_regreso: '2026-07-10', precio_base: 3500, divisa_base: 'USD', cupos_maximos: 12 },
            { id: 2, destino: 'Agujero Azul, Belice - Gran Expedición', fecha_salida: '2026-10-05', fecha_regreso: '2026-10-15', precio_base: 2800, divisa_base: 'USD', cupos_maximos: 10 },
            { id: 3, destino: 'Cozumel, México - Arrecifes Flotantes', fecha_salida: '2026-12-01', fecha_regreso: '2026-12-08', precio_base: 1800, divisa_base: 'USD', cupos_maximos: 15 }
          ]);

          setClientes([
            { id: 4, nombre_completo: 'Carlos Mendoza', identificacion: '10203040', telefono: '+57 300 123 4567', correo: 'carlos@mendoza.com', fecha_nacimiento: '1992-04-12', nivel_certificacion: 'Rescue Diver', agencia_certificacion: 'PADI', seguro: 'DAN Activo', id_certificacion: 'PADI-9811A', contacto_emergencia_nombre: 'Sofía Mendoza (Hermana)', contacto_emergencia_tel: '+57 311 555 1234', tipo_sangre: 'O+', alergias_enfermedades: 'Alergia a la Penicilina', loyalty: true },
            { id: 5, nombre_completo: 'Ana María Restrepo', identificacion: '98765432', telefono: '+57 311 987 6543', correo: 'ana@restrepo.org', fecha_nacimiento: '1988-11-20', nivel_certificacion: 'Divemaster', agencia_certificacion: 'SSI', seguro: 'DAN Activo', id_certificacion: '', contacto_emergencia_nombre: 'Andrés Restrepo (Padre)', contacto_emergencia_tel: '+57 315 222 9876', tipo_sangre: 'A+', alergias_enfermedades: '', loyalty: false },
            { id: 6, nombre_completo: 'Jorge Iván Giraldo', identificacion: '71222444', telefono: '+57 315 456 7890', correo: 'jorge@giraldo.net', fecha_nacimiento: '1979-08-05', nivel_certificacion: 'En Curso', agencia_certificacion: 'PADI', seguro: 'Vencido', id_certificacion: 'PIC-COIB8829', contacto_emergencia_nombre: 'María Giraldo (Esposa)', contacto_emergencia_tel: '+57 310 999 8888', tipo_sangre: 'O-', alergias_enfermedades: 'Hipertensión controlada', loyalty: false }
          ]);

          setProveedores([
            { id: 1, nombre_comercial: 'Expediciones Coiba Express', tipo_servicio: 'Transporte Marítimo / Bote', nit_identificacion: 'NIT 900-1234', contacto_nombre: 'Cap. Juan', telefono: '+507 6123-4567' },
            { id: 2, nombre_comercial: 'Eco-Resort Coral del Mar', tipo_servicio: 'Hospedaje e Instalaciones', nit_identificacion: 'NIT 890-5678', contacto_nombre: 'Marta Lucía', telefono: '+57 300 987 6543' },
            { id: 3, nombre_comercial: 'Gases Técnicos de Occidente', tipo_servicio: 'Carga de Gases (Aire/Nitrox)', nit_identificacion: 'NIT 901-4321', contacto_nombre: 'Ing. Alberto', telefono: '+57 312 456 7890' }
          ]);

          setTransacciones([
            { id: 101, fecha_registro: '2026-06-23T12:00:00Z', tipo: 'Ingreso', monto_original: 1500, moneda_original: 'USD', trm_digitada: 4000, monto_cop: 6000000, viaje_id: 1, cliente_id: 4, proveedor_id: null, descripcion: 'Abono Inicial de Carlos Mendoza', cuenta_origen_destino: 'Cuenta de Ahorros Principal' },
            { id: 102, fecha_registro: '2026-06-23T12:00:00Z', tipo: 'Ingreso', monto_original: 800, moneda_original: 'USD', trm_digitada: 4000, monto_cop: 3200000, viaje_id: 1, cliente_id: 5, proveedor_id: null, descripcion: 'Abono de Ana María Restrepo', cuenta_origen_destino: 'Cuenta de Ahorros Principal' },
            { id: 104, fecha_registro: '2026-06-25T12:00:00Z', tipo: 'Ingreso', monto_original: 2800, moneda_original: 'USD', trm_digitada: 4000, monto_cop: 11200000, viaje_id: 2, cliente_id: 4, proveedor_id: null, descripcion: 'Pago Total Belice Carlos M.', cuenta_origen_destino: 'Cuenta de Ahorros Principal' }
          ]);

          setReservas([
            { id: 1, viaje_id: 1, cliente_id: 4, precio_pactado_total: 3500, estado_reserva: 'Abonado' },
            { id: 2, viaje_id: 1, cliente_id: 5, precio_pactado_total: 3500, estado_reserva: 'Abonado' },
            { id: 3, viaje_id: 2, cliente_id: 4, precio_pactado_total: 2800, estado_reserva: 'Saldado' }
          ]);
        }
      } finally {
        if (isMounted) {
          setCargando(false);
        }
      }
    };

    // Registrar y cargar el Script SDK de Supabase de manera dinámica para evitar conflictos ESM locales
    const scriptId = 'supabase-sdk-script';
    let script = document.getElementById(scriptId);

    const onScriptLoad = () => {
      fetchData();
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.async = true;
      script.onload = onScriptLoad;
      script.onerror = () => {
        console.error("No se pudo cargar el archivo SDK de Supabase.");
        fetchData();
      };
      document.body.appendChild(script);
    } else {
      if (window.supabase) {
        fetchData();
      } else {
        script.addEventListener('load', onScriptLoad);
      }
    }

    return () => {
      isMounted = false;
      if (script) {
        script.removeEventListener('load', onScriptLoad);
      }
    };
  }, []);

  // Inyectar datos semilla a Supabase
  const seedDatosDePruebaEnSupabase = async () => {
    try {
      setIntentandoSeed(true);
      setMensajeSeed("Inyectando expediciones de buceo...");

      const client = getSupabase();
      if (!client) {
        throw new Error("El SDK de Supabase no está cargado.");
      }

      // 1. Insertar Viajes
      const { error: errV } = await client.from('viajes').insert([
        { id: 1, destino: 'Malpelo, Colombia - Tiburón Martillo', fecha_salida: '2026-07-01', fecha_regreso: '2026-07-10', precio_base: 3500, divisa_base: 'USD', cupos_maximos: 12 },
        { id: 2, destino: 'Agujero Azul, Belice - Gran Expedición', fecha_salida: '2026-10-05', fecha_regreso: '2026-10-15', precio_base: 2800, divisa_base: 'USD', cupos_maximos: 10 },
        { id: 3, destino: 'Cozumel, México - Arrecifes Flotantes', fecha_salida: '2026-12-01', fecha_regreso: '2026-12-08', precio_base: 1800, divisa_base: 'USD', cupos_maximos: 15 }
      ]);

      if (errV) throw new Error(`Error en viajes: ${errV.message}. Es muy probable que sigan bloqueados por políticas RLS.`);

      setMensajeSeed("Inyectando buzos y expedientes médicos...");
      // 2. Insertar Clientes
      const { error: errC } = await client.from('clientes').insert([
        { id: 4, nombre_completo: 'Carlos Mendoza', identificacion: '10203040', telefono: '+57 300 123 4567', correo: 'carlos@mendoza.com', fecha_nacimiento: '1992-04-12', nivel_certificacion: 'Rescue Diver', agencia_certificacion: 'PADI', seguro: 'DAN Activo', id_certificacion: 'PADI-9811A', contacto_emergencia_nombre: 'Sofía Mendoza (Hermana)', contacto_emergencia_tel: '+57 311 555 1234', tipo_sangre: 'O+', alergias_enfermedades: 'Alergia a la Penicilina', loyalty: true },
        { id: 5, nombre_completo: 'Ana María Restrepo', identificacion: '98765432', telefono: '+57 311 987 6543', correo: 'ana@restrepo.org', fecha_nacimiento: '1988-11-20', nivel_certificacion: 'Divemaster', agencia_certificacion: 'SSI', seguro: 'DAN Activo', id_certificacion: '', contacto_emergencia_nombre: 'Andrés Restrepo (Padre)', contacto_emergencia_tel: '+57 315 222 9876', tipo_sangre: 'A+', alergias_enfermedades: '', loyalty: false },
        { id: 6, nombre_completo: 'Jorge Iván Giraldo', identificacion: '71222444', telefono: '+57 315 456 7890', correo: 'jorge@giraldo.net', fecha_nacimiento: '1979-08-05', nivel_certificacion: 'En Curso', agencia_certificacion: 'PADI', seguro: 'Vencido', id_certificacion: 'PIC-COIB8829', contacto_emergencia_nombre: 'María Giraldo (Esposa)', contacto_emergencia_tel: '+57 310 999 8888', tipo_sangre: 'O-', alergias_enfermedades: 'Hipertensión controlada', loyalty: false }
      ]);

      if (errC) throw new Error(`Error en clientes: ${errC.message}`);

      setMensajeSeed("Inyectando aliados y botes...");
      // 3. Insertar Proveedores
      const { error: errP } = await client.from('proveedores').insert([
        { id: 1, nombre_comercial: 'Expediciones Coiba Express', tipo_servicio: 'Transporte Marítimo / Bote', nit_identificacion: 'NIT 900-1234', contacto_nombre: 'Cap. Juan', telefono: '+507 6123-4567' },
        { id: 2, nombre_comercial: 'Eco-Resort Coral del Mar', tipo_servicio: 'Hospedaje e Instalaciones', nit_identificacion: 'NIT 890-5678', contacto_nombre: 'Marta Lucía', telefono: '+57 300 987 6543' },
        { id: 3, nombre_comercial: 'Gases Técnicos de Occidente', tipo_servicio: 'Carga de Gases (Aire/Nitrox)', nit_identificacion: 'NIT 901-4321', contacto_nombre: 'Ing. Alberto', telefono: '+57 312 456 7890' }
      ]);

      if (errP) throw new Error(`Error en proveedores: ${errP.message}`);

      setMensajeSeed("Inyectando libro de transacciones de caja...");
      // 4. Insertar Transacciones
      const { error: errT } = await client.from('transacciones').insert([
        { id: 101, tipo: 'Ingreso', monto_original: 1500, moneda_original: 'USD', trm_digitada: 4000, viaje_id: 1, cliente_id: 4, proveedor_id: null, descripcion: 'Abono Inicial de Carlos Mendoza', cuenta_origen_destino: 'Cuenta de Ahorros Principal' },
        { id: 102, tipo: 'Ingreso', monto_original: 800, moneda_original: 'USD', trm_digitada: 4000, viaje_id: 1, cliente_id: 5, proveedor_id: null, descripcion: 'Abono de Ana María Restrepo', cuenta_origen_destino: 'Cuenta de Ahorros Principal' },
        { id: 104, tipo: 'Ingreso', monto_original: 2800, moneda_original: 'USD', trm_digitada: 4000, viaje_id: 2, cliente_id: 4, proveedor_id: null, descripcion: 'Pago Total Belice Carlos M.', cuenta_origen_destino: 'Cuenta de Ahorros Principal' }
      ]);

      if (errT) throw new Error(`Error en transacciones: ${errT.message}`);

      setMensajeSeed("Inyectando reservas activas...");
      // 5. Insertar Reservas Semilla
      const { error: errR } = await client.from('reservas').insert([
        { id: 1, viaje_id: 1, cliente_id: 4, precio_pactado_total: 3500, estado_reserva: 'Abonado' },
        { id: 2, viaje_id: 1, cliente_id: 5, precio_pactado_total: 3500, estado_reserva: 'Abonado' },
        { id: 3, viaje_id: 2, cliente_id: 4, precio_pactado_total: 2800, estado_reserva: 'Saldado' }
      ]);

      if (errR) throw new Error(`Error en reservas: ${errR.message}`);

      setMensajeSeed("¡Sincronización de base de datos completada!");
      await recargarDatosDesdeSupabase();
      setTimeout(() => setMensajeSeed(''), 4000);
    } catch (error) {
      console.error(error);
      setMensajeSeed(`❌ Error: ${error.message}`);
    } finally {
      setIntentandoSeed(false);
    }
  };

  const agregarViaje = async (nuevo) => {
    const client = getSupabase();
    if (conectadoSupabase && client) {
      const { data, error } = await client.from('viajes').insert([nuevo]).select();
      if (!error && data) {
        setViajes([...viajes, data[0]]);
      } else {
        alert(`Error al registrar en Supabase: ${error?.message || 'Verifica el RLS de la tabla viajes'}`);
      }
    } else {
      setViajes([...viajes, { id: Date.now(), ...nuevo }]);
    }
  };

  const actualizarViaje = async (viajeModificado) => {
    const client = getSupabase();
    if (conectadoSupabase && client) {
      const { id, ...fields } = viajeModificado;
      const { error } = await client.from('viajes').update(fields).eq('id', id);
      if (!error) {
        setViajes(viajes.map(v => v.id === id ? viajeModificado : v));
      } else {
        alert(`Error al actualizar en Supabase: ${error?.message}`);
      }
    } else {
      setViajes(viajes.map(v => v.id === viajeModificado.id ? viajeModificado : v));
    }
  };

  const agregarTransaccion = async (nueva) => {
    const client = getSupabase();
    if (conectadoSupabase && client) {
      const { data, error } = await client.from('transacciones').insert([nueva]).select();
      if (!error && data) {
        setTransacciones([data[0], ...transacciones]);
      } else {
        alert(`Error al registrar transacción en Supabase: ${error?.message || 'Verifica el RLS'}`);
      }
    } else {
      const fallback = {
        id: Date.now(),
        fecha_registro: new Date().toISOString(),
        monto_cop: nueva.monto_original * (nueva.trm_digitada || 1),
        ...nueva
      };
      setTransacciones([fallback, ...transacciones]);
    }
  };

  const agregarCliente = async (nuevo) => {
    const client = getSupabase();
    if (conectadoSupabase && client) {
      const { data, error } = await client.from('clientes').insert([nuevo]).select();
      if (!error && data) {
        setClientes([...clientes, data[0]]);
      } else {
        alert(`Error al registrar cliente en Supabase: ${error?.message || 'Verifica el RLS'}`);
      }
    } else {
      setClientes([...clientes, { id: Date.now(), ...nuevo }]);
    }
  };

  const actualizarCliente = async (clienteModificado) => {
    const client = getSupabase();
    if (conectadoSupabase && client) {
      const { id, ...fields } = clienteModificado;
      const { error } = await client.from('clientes').update(fields).eq('id', id);
      if (!error) {
        setClientes(clientes.map(c => c.id === id ? clienteModificado : c));
      } else {
        alert(`Error al actualizar cliente en Supabase: ${error?.message}`);
      }
    } else {
      setClientes(clientes.map(c => c.id === clienteModificado.id ? clienteModificado : c));
    }
  };

  const agregarProveedor = async (nuevo) => {
    const client = getSupabase();
    if (conectadoSupabase && client) {
      const { data, error } = await client.from('proveedores').insert([nuevo]).select();
      if (!error && data) {
        setProveedores([...proveedores, data[0]]);
      } else {
        alert(`Error al registrar proveedor en Supabase: ${error?.message}`);
      }
    } else {
      setProveedores([...proveedores, { id: Date.now(), ...nuevo }]);
    }
  };

  const actualizarProveedor = async (proveedorModificado) => {
    const client = getSupabase();
    if (conectadoSupabase && client) {
      const { id, ...fields } = proveedorModificado;
      const { error } = await client.from('proveedores').update(fields).eq('id', id);
      if (!error) {
        setProveedores(proveedores.map(p => p.id === id ? proveedorModificado : p));
      } else {
        alert(`Error al actualizar proveedor en Supabase: ${error?.message}`);
      }
    } else {
      setProveedores(proveedores.map(p => p.id === proveedorModificado.id ? proveedorModificado : p));
    }
  };

  const agregarReserva = async (nueva) => {
    const client = getSupabase();
    if (conectadoSupabase && client) {
      const { data, error } = await client.from('reservas').insert([nueva]).select();
      if (!error && data) {
        setReservas([...reservas, data[0]]);
      } else {
        alert(`Error al registrar reserva en Supabase: ${error?.message || 'Verifica el RLS de la tabla reservas'}`);
      }
    } else {
      setReservas([...reservas, { id: Date.now(), ...nueva }]);
    }
  };

  const eliminarReserva = async (reservaId) => {
    const client = getSupabase();
    if (conectadoSupabase && client) {
      const { error } = await client.from('reservas').delete().eq('id', reservaId);
      if (!error) {
        setReservas(reservas.filter(r => r.id !== reservaId));
      } else {
        alert(`Error al eliminar la reserva: ${error.message}`);
      }
    } else {
      setReservas(reservas.filter(r => r.id !== reservaId));
    }
  };

  const totalIngresos = transacciones.filter(t => t.tipo === 'Ingreso').reduce((sum, t) => sum + (t.monto_cop || 0), 0);
  const totalSalidas = transacciones.filter(t => t.tipo === 'Salida').reduce((sum, t) => sum + (t.monto_cop || 0), 0);
  const saldoTotalConsolidado = totalIngresos - totalSalidas;

  // Determinar si la base de datos de Supabase está conectada pero totalmente vacía
  const baseDeDatosVacia = conectadoSupabase && viajes.length === 0 && clientes.length === 0 && proveedores.length === 0;

  // Helper para cambiar de vista y colapsar el menú en móviles inmediatamente
  const navegarA = (vista) => {
    setVistaActual(vista);
    setSidebarOpen(false);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#060d1a] flex flex-col justify-center items-center gap-4">
        <div className="w-16 h-16 border-4 border-cyan-500/25 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-sm font-black text-cyan-400 uppercase tracking-widest animate-pulse">
          Sincronizando con base de datos en la nube...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060d1a] relative overflow-hidden flex flex-col md:flex-row font-sans antialiased text-slate-200">
      
      {/* Orbes decorativos bioluminiscentes */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-700/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-amber-600/5 blur-[150px] pointer-events-none"></div>

      {/* CABECERA EXCLUSIVA PARA MÓVILES (Navbar superior persistente en celulares) */}
      <header className="md:hidden w-full bg-[#0a1120]/90 backdrop-blur-xl border-b border-slate-800/80 p-4 flex justify-between items-center z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-white hover:text-cyan-400 focus:outline-none transition-colors"
            title="Abrir Menú"
          >
            {/* Icono de 3 barras (Hamburguesa) */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🤿</span>
            <span className="text-xs font-black tracking-widest text-white uppercase">DIVE ACADEMY</span>
          </div>
        </div>

        {/* Punto de estado Supabase rápido en cabecera móvil */}
        <div className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${conectadoSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'}`}></span>
          <span className="text-[9px] font-bold font-mono tracking-widest uppercase text-slate-400">
            {conectadoSupabase ? 'En línea' : 'Local'}
          </span>
        </div>
      </header>

      {/* OVERLAY PARA MÓVILES (Cierra el menú al hacer tap fuera) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 1. BARRA LATERAL (SIDEBAR DRAWER COMPACTA/DESPLEGABLE RESPONSIVA) */}
      <aside className={`
        fixed md:sticky top-0 bottom-0 left-0 w-64 bg-[#0a1120]/95 backdrop-blur-xl border-r border-slate-800/60 
        flex flex-col justify-between z-50 shadow-[5px_0_30px_rgba(0,0,0,0.3)] h-screen transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div>
          {/* Logo y Botón de cerrar para dispositivos móviles */}
          <div className="p-6 border-b border-slate-800/80 bg-[#070e1b]/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                🤿
              </div>
              <div>
                <h1 className="text-sm font-black tracking-widest text-white uppercase">DIVE ACADEMY</h1>
                <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5">Control de Caja</p>
              </div>
            </div>

            {/* Botón exclusivo para cerrar la barra en celulares */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              title="Cerrar Menú"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menú de Navegación Responsivo */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
            
            <button
              onClick={() => navegarA('resumen')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-left gap-3
                ${vistaActual === 'resumen' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_5px_15px_rgba(245,158,11,0.2)]' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
            >
              <span className="text-sm">📋</span> Resumen de Cajas
            </button>

            <button
              onClick={() => navegarA('abonos')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-left gap-3
                ${vistaActual === 'abonos' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_5px_15px_rgba(245,158,11,0.2)]' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
            >
              <span className="text-sm">➕</span> Registrar Abono / Gasto
            </button>

            <button
              onClick={() => navegarA('reservas')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-left gap-3
                ${vistaActual === 'reservas' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_5px_15px_rgba(245,158,11,0.2)]' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
            >
              <span className="text-sm">🎫</span> Gestión de Reservas
            </button>

            {/* LÍNEA DIVISORIA MINIMALISTA */}
            <hr className="border-slate-800/80 my-3" />

            <button
              onClick={() => navegarA('viajes')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-left gap-3
                ${vistaActual === 'viajes' 
                  ? 'bg-gradient-to-r from-[#0c2c47] to-[#04111f] border border-cyan-500/30 text-cyan-400 shadow-[0_5px_15px_rgba(6,182,212,0.1)]' 
                  : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
            >
              <span className="text-sm">🗺️</span> Gestión de Viajes
            </button>

            <button
              onClick={() => navegarA('clientes')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-left gap-3
                ${vistaActual === 'clientes' 
                  ? 'bg-gradient-to-r from-[#0c2c47] to-[#04111f] border border-cyan-500/30 text-cyan-400 shadow-[0_5px_15px_rgba(6,182,212,0.1)]' 
                  : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
            >
              <span className="text-sm">👥</span> Gestión de Clientes
            </button>

            <button
              onClick={() => navegarA('proveedores')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-left gap-3
                ${vistaActual === 'proveedores' 
                  ? 'bg-gradient-to-r from-[#0c2c47] to-[#04111f] border border-cyan-500/30 text-cyan-400 shadow-[0_5px_15px_rgba(6,182,212,0.1)]' 
                  : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
            >
              <span className="text-sm">🏢</span> Gestión de Proveedores
            </button>

          </nav>
        </div>

        {/* Pie de Barra Lateral */}
        <div className="p-4 border-t border-slate-800/80 bg-[#070e1b]/30 text-center">
          <p className="text-[10px] text-slate-500">Conectado a Supabase</p>
          <p className={`text-[9px] font-bold mt-0.5 font-mono uppercase tracking-widest
            ${conectadoSupabase ? 'text-emerald-400 animate-pulse' : 'text-amber-500'}`}>
            ● {conectadoSupabase ? 'CONECTADO A SUPABASE' : 'MODO LOCAL / OFFLINE'}
          </p>
        </div>
      </aside>

      {/* 2. ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto relative z-10 w-full">
        <div className="max-w-7xl mx-auto">
          
          {/* BANNER DINÁMICO DE DIAGNÓSTICO RLS */}
          {baseDeDatosVacia && (
            <div className="mb-8 bg-gradient-to-br from-[#0c233a] to-[#061424] border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl animate-fade-in relative overflow-hidden group">
              <div className="absolute top-[-30%] right-[-10%] w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/15 transition-all"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                      🛠️ Soporte de Integración
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  </div>
                  <h3 className="text-lg font-black text-white">¿La base de datos aparece vacía? Políticas RLS de Supabase</h3>
                  <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                    Si tu consola de Supabase ya tiene tablas creadas pero aquí todo se visualiza en blanco, es debido a la seguridad **RLS (Row Level Security)** que viene activa de fábrica. Esto bloquea las consultas anónimas regresando 0 registros en lugar de un error.
                  </p>
                  <div className="text-[11px] bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-slate-400 font-mono mt-2 space-y-1">
                    <p className="text-cyan-400 font-bold">// Ejecuta este comando en el SQL Editor de Supabase:</p>
                    <p>ALTER TABLE viajes DISABLE ROW LEVEL SECURITY;</p>
                    <p>ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto self-stretch md:set-center justify-center">
                  <button
                    onClick={seedDatosDePruebaEnSupabase}
                    disabled={intentandoSeed}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white text-xs font-black uppercase tracking-wider px-6 py-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 whitespace-nowrap"
                  >
                    {intentandoSeed ? '⏳ Procesando...' : '🚀 Seedar Datos en la Nube'}
                  </button>
                  {mensajeSeed && (
                    <p className="text-[10px] text-center font-bold text-amber-400 tracking-wide animate-pulse">{mensajeSeed}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VISTA PRINCIPAL: RESUMEN DE CAJAS */}
          {vistaActual === 'resumen' && (
            <div className="space-y-8">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-wider text-white">Saldos Disponibles (COP)</h2>
                  <p className="text-sm text-slate-400">Estado consolidado de las cajas de Dive Academy</p>
                </div>
                <button className="bg-slate-800/50 hover:bg-slate-800 text-cyan-400 border border-slate-700/60 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all">
                  Restaurar Saldos Base
                </button>
              </div>

              {/* Grid de Balances en Tarjetas de Cristal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'CUENTA DA', value: '$ 43.204.651', desc: 'Bancos Generales' },
                  { title: 'CUENTA BUILES', value: '$ 20.689.176', desc: 'Fondo Alternativo' },
                  { title: 'NU JM', value: '$ 3.718.800', desc: 'Operaciones Especiales' },
                  { title: 'NU JB', value: '$ 3.156.332', desc: 'Inversiones Buceo' },
                  { title: 'EFECTIVO CAJA', value: '$ 8.891.750', desc: 'Caja Física en Tienda' },
                  { title: 'TOTAL EN BOLSILLOS', value: `$ ${saldoTotalConsolidado.toLocaleString()}`, desc: 'Consolidado Dinámico', accent: true },
                ].map((card, i) => (
                  <div 
                    key={i} 
                    className={`rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:scale-[1.02]
                      ${card.accent 
                        ? 'bg-gradient-to-br from-[#0c2c47]/80 to-[#04111f]/80 border-cyan-500/30 shadow-[0_10px_30px_rgba(6,182,212,0.15)]' 
                        : 'bg-[#0b1528]/60 backdrop-blur-md border-slate-700/60'}`}
                  >
                    <span className="text-[10px] uppercase tracking-widest font-black text-cyan-400 block mb-1">{card.title}</span>
                    <h3 className="text-2xl font-black text-white mt-1 font-mono tracking-tight">{card.value}</h3>
                    <p className="text-xs text-slate-500 mt-2">{card.desc}</p>
                  </div>
                ))}
              </div>

              {/* Secciones de Gráfico y Reporte */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Distribución */}
                <div className="lg:col-span-2 bg-[#0b1528]/60 backdrop-blur-md border border-slate-700/60 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white mb-2">Distribución de Recursos</h4>
                    <p className="text-xs text-slate-400 mb-6">Proporción consolidada de dinero líquido en bancos vs efectivo físico</p>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                          <span>FONDOS EN BANCOS DIGITALES</span>
                          <span className="text-cyan-400">89%</span>
                        </div>
                        <div className="w-full bg-[#070e1b] rounded-full h-3 overflow-hidden">
                          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full" style={{ width: '89%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                          <span>LIQUIDEZ EN EFECTIVO</span>
                          <span className="text-amber-400">11%</span>
                        </div>
                        <div className="w-full bg-[#070e1b] rounded-full h-3 overflow-hidden">
                          <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full" style={{ width: '11%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Descarga */}
                <div className="bg-[#0b1528]/60 backdrop-blur-md border border-slate-700/60 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white mb-2">Resguardo Offline</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Descarga una copia de seguridad local del histórico total de transacciones financieras para trabajar sin internet.</p>
                  </div>
                  <button className="w-full bg-[#0c1a2e]/80 hover:bg-slate-800 border border-slate-700/80 text-white text-xs font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                    📥 Exportar Historial a Excel
                  </button>
                </div>

              </div>

              {/* Historial de Movimientos de la Sesión */}
              <div className="bg-[#0b1528]/60 backdrop-blur-md border border-slate-700/60 rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white">Últimos Movimientos Registrados</h4>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-slate-400 uppercase font-black border-b border-slate-800 text-[9px] tracking-widest">
                        <th className="py-3 px-2">Fecha</th>
                        <th className="py-3 px-2">Tipo</th>
                        <th className="py-3 px-2">Monto</th>
                        <th className="py-3 px-2">Asociado a</th>
                        <th className="py-3 px-2">Concepto</th>
                        <th className="py-3 px-2">Caja Destino</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                      {transacciones.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-slate-500 text-xs">
                            No hay transacciones registradas aún.
                          </td>
                        </tr>
                      ) : (
                        transacciones.map((t) => {
                          const viaje = viajes.find(v => v.id === t.viaje_id);
                          return (
                            <tr key={t.id} className="hover:bg-slate-800/20 transition-all">
                              <td className="py-4 px-2 text-slate-500 font-mono">{t.fecha_registro?.split('T')[0]}</td>
                              <td className="py-4 px-2">
                                <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider inline-block
                                  ${t.tipo === 'Salida'
                                    ? 'bg-rose-950/60 text-rose-400 border border-rose-500/20' 
                                    : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'}`}>
                                  {t.tipo}
                                </span>
                              </td>
                              <td className="py-4 px-2 font-black text-white font-mono">{t.monto_original} {t.moneda_original}</td>
                              <td className="py-4 px-2 font-bold text-cyan-400">{viaje ? viaje.destino.split(' - ')[0] : 'General'}</td>
                              <td className="py-4 px-2 text-slate-400">{t.descripcion}</td>
                              <td className="py-4 px-2 text-slate-500 font-mono">{t.cuenta_origen_destino}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* VISTA: REGISTRAR ABONO / GASTO */}
          {vistaActual === 'abonos' && (
            <FormularioAbono 
              viajes={viajes} 
              clientes={clientes} 
              proveedores={proveedores}
              agregarTransaccion={agregarTransaccion} 
            />
          )}

          {/* VISTA: GESTIÓN DE RESERVAS */}
          {vistaActual === 'reservas' && (
            <GestionReservas
              reservas={reservas}
              viajes={viajes}
              clientes={clientes}
              transacciones={transacciones}
              agregarReserva={agregarReserva}
              eliminarReserva={eliminarReserva}
            />
          )}

          {/* VISTA: GESTIÓN DE VIAJES */}
          {vistaActual === 'viajes' && (
            <GestionViajes 
              viajes={viajes} 
              clientes={clientes} 
              transacciones={transacciones} 
              agregarViaje={agregarViaje}
              actualizarViaje={actualizarViaje}
            />
          )}

          {/* VISTA: GESTIÓN DE CLIENTES */}
          {vistaActual === 'clientes' && (
            <GestionClientes 
              clientes={clientes} 
              agregarCliente={agregarCliente} 
              actualizarCliente={actualizarCliente} 
            />
          )}

          {/* VISTA: GESTIÓN DE PROVEEDORES */}
          {vistaActual === 'proveedores' && (
            <GestionProveedores 
              proveedores={proveedores}
              agregarProveedor={agregarProveedor}
              actualizarProveedor={actualizarProveedor}
            />
          )}

        </div>
      </main>

    </div>
  );
}