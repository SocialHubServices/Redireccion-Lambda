import moment from 'moment-timezone';

function obtenerFechaActual(zonaHoraria) {
    // Mapeo de zonas horarias
    const zonasHorarias = {
        'Argentina Standard Time': 'America/Argentina/Buenos_Aires',
        'Central European Standard Time': 'Europe/Berlin',
        'Central Standard Time': 'America/Chicago',
        'Central Standard Time (Mexico)': 'America/Mexico_City',
        'E. South America Standard Time': 'America/Sao_Paulo',
        'Eastern Standard Time': 'America/New_York',
        'Montevideo Standard Time': 'America/Montevideo',
        'Pacific SA Standard Time': 'America/Santiago',
        'SA Pacific Standard Time': 'America/Lima',
        'Venezuela Standard Time': 'America/Caracas'
    };

    const ahora = moment().tz(zonasHorarias[zonaHoraria]);
    const fechaFormateada = ahora.format('YYYY-MM-DD HH:mm:ss.SSS');

    return fechaFormateada;
}

export default obtenerFechaActual