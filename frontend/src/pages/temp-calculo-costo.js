  const calcularCosto = () => {
    const espacio = espacios.find(e => e.id === parseInt(formData.espacio_id));
    if (!espacio || !espacio.cobro_activo || !formData.fecha) {
      setCostoCalculado(0);
      return;
    }

    const fechaReserva = new Date(formData.fecha);
    const diaSemana = fechaReserva.getDay(); // 0=Domingo, 1=Lunes, ..., 5=Viernes, 6=Sábado
    const diaMes = String(fechaReserva.getDate()).padStart(2, '0');
    const mes = String(fechaReserva.getMonth() + 1).padStart(2, '0');
    const fechaStr = ${diaMes}-;
    
    // Verificar si es día festivo (Viernes, Sábado o fecha en dias_festivos)
    const esFestivo = (diaSemana === 5 || diaSemana === 6);
    const esFestivoExtra = espacio.dias_festivos?.split(',').map(d => d.trim()).includes(fechaStr);
    
    let costo = 0;
    if (esFestivo || esFestivoExtra) {
      costo = espacio.costo_dia_festivo || 0;
    } else {
      costo = espacio.costo_dia_semana || 0;
    }
    
    setCostoCalculado(costo);
  };
