  const generarGastosComunes = async () => {
    // Usar dos prompts separados
    const mesInput = prompt('Ingrese el mes (ej: Enero, Febrero, Julio, diciembre):');
    if (!mesInput) return;
    
    const anioInput = prompt('Ingrese el año (ej: 2026):');
    if (!anioInput) return;
    
    // Normalizar: primera letra mayúscula, resto minúscula
    const meses = {
      'enero': 'Enero', 'febrero': 'Febrero', 'marzo': 'Marzo', 'abril': 'Abril',
      'mayo': 'Mayo', 'junio': 'Junio', 'julio': 'Julio', 'agosto': 'Agosto',
      'septiembre': 'Septiembre', 'octubre': 'Octubre', 'noviembre': 'Noviembre', 'diciembre': 'Diciembre'
    };
    
    const mesLower = mesInput.toLowerCase().trim();
    const mesNormalizado = meses[mesLower];
    
    if (!mesNormalizado) {
      alert('Mes inválido. Usa: Enero, Febrero, Marzo, Abril, Mayo, Junio, Julio, Agosto, Septiembre, Octubre, Noviembre, Diciembre');
      return;
    }
    
    const anio = parseInt(anioInput);
    if (isNaN(anio) || anio < 2000 || anio > 2100) {
      alert('Año inválido. Usa un año entre 2000 y 2100');
      return;
    }
    
    const periodo = mesNormalizado + ' ' + anio;
    
    try {
      const response = await axios.post(API + '/generar-gastos-comunes', { periodo, mes: mesNormalizado, anio });
      alert(response.data.message);
      cargarPeriodos();
      setPeriodoActual(periodo);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };
