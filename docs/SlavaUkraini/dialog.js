var SESSION_KEY = 'ukraini-dialog-session';
var ONE_DAY_MILLI_SEC = 24 * 60 * 60 * 1000;

function openSlavaUkrainiDialog() {

	if (sessionStorage) {
		var session = sessionStorage.getItem(SESSION_KEY);
		// open the dialog only every 24 hours
		if (session && Date.now() - session < ONE_DAY_MILLI_SEC) {
			return;
		}
	}

	var html = '<div class=\'container iframe-container\'><iframe tabindex="1" src=\'/SlavaUkraini/\'></iframe><a tabindex="2" role="button" class=\'close-dialog\' aria-label=\'close\'>&times;</a></div>';

	var dialog = document.createElement('div');
	dialog.id = 'ukraini-dialog';
	dialog.innerHTML = html;

	document.body.appendChild(dialog);
	document.body.classList.add('overflowHidden');

	setTimeout(function () {
		dialog.focus();
	}, 100);

	var closeBtn = document.querySelector('.close-dialog');
	closeBtn.addEventListener('click', function () {
		var dialog = document.getElementById('ukraini-dialog');
		document.body.removeChild(dialog);
		document.body.classList.remove('overflowHidden');
		if (sessionStorage) {
			sessionStorage.setItem(SESSION_KEY, Date.now());
		}
	});

	// keep focus in dialog
	// https://css-tricks.com/a-css-approach-to-trap-focus-inside-of-an-element/
	dialog.addEventListener('transitionend', function () {
		dialog.querySelector('iframe').focus();
	});
}

openSlavaUkrainiDialog();
