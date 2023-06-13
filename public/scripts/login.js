window.addEventListener('load', (ev) => {
    let error = new URL(window.location.href).searchParams.get('error_code');
    if(!error) return;
    document.querySelectorAll("#basic-lbl").forEach((el) => {
        el.innerHTML = el.innerHTML +=` <span id='error-msg'>${error_codes[error].replaceAll('_', ' ')}</span>`;
    });
}
);