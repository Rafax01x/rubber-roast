/**
 * Funny roasting messages, in Indonesian and English, for the issues
 * scanDocument finds. Kept separate from the scanner so the jokes can
 * be edited without touching the detection logic.
 */

export const EMPTY_CATCH_ROASTS: readonly string[] = [
	'catch kosong ini bukan error handling, ini pengabaian.',
	'error-nya ditangkap, lalu dilepas lagi tanpa pamit.',
	'try-nya serius, catch-nya cuma formalitas.',
	'kalau error ini hilang, jangan tanya ke siapa-siapa — kamu sendiri yang membuangnya.',
	'catch kosong: tempat error beristirahat dengan tenang, selamanya.',
	'ini bukan menangani error, ini menyembunyikan barang bukti.',
	'error masuk catch, keluarnya jadi kenangan.',
	'debug nanti, sekarang pura-pura tidak terjadi apa-apa.'
];

export const CONSOLE_LOG_ROASTS: readonly string[] = [
	'console.log ke-6: kamu debugging atau live streaming?',
	'console.log sebanyak ini, log-nya lebih panjang dari kodenya.',
	'kalau semua log ini dihapus, file-nya langsung diet 30%.',
	'debugging boleh, tapi ini sudah jadi dokumentasi dadakan.',
	'console.log lagi, console.log lagi — terminal kamu capek.',
	'log sebanyak ini biasanya berakhir dengan satu kalimat: "loh, kok yang ini tidak ke-print?"',
	'satu console.log itu debugging, enam itu curhat.',
	'produksi nanti melihat log ini dan bertanya: ini aplikasi atau diary?'
];

export const TODO_FIXME_ROASTS: readonly string[] = [
	'TODO ini sudah lebih tua dari sprint-nya.',
	'FIXME ditulis, lalu dilupakan dengan sangat konsisten.',
	'TODO: dikerjakan nanti. Nanti: tidak pernah datang.',
	'kode ini minta tolong lewat komentar, dan tidak ada yang menjawab.',
	'FIXME ini seperti janji manis: ditulis dengan niat, dibiarkan dengan ikhlas.',
	'TODO di sini sudah jadi penghuni tetap, bukan tamu.'
];

export const GENERAL_ROASTS: readonly string[] = [
	'kode ini jalan, tapi dengan cara yang membuat reviewer geleng-geleng.',
	'berfungsi? ya. Bangga? sebaiknya jangan dulu.',
	'kalau kode bisa bicara, yang ini sedang minta maaf.'
];

export const EMPTY_CATCH_ROASTS_EN: readonly string[] = [
	'an empty catch is not error handling, it is abandonment.',
	'the error was caught, then released without a word.',
	'the try is serious, the catch is just a formality.',
	'if this error goes missing, do not ask anyone — you threw it away yourself.',
	'an empty catch: where errors rest in peace, forever.',
	'this is not handling an error, this is hiding the evidence.',
	'the error enters the catch and leaves as a memory.',
	'debug later, pretend nothing happened for now.'
];

export const CONSOLE_LOG_ROASTS_EN: readonly string[] = [
	'console.log number 6: are you debugging or live streaming?',
	'this many console.logs, and the logs are longer than the code.',
	'delete all these logs and the file instantly loses 30% of its weight.',
	'debugging is fine, but this has become accidental documentation.',
	'console.log again, console.log again — your terminal is tired.',
	'this many logs usually end with one sentence: "wait, why did this one not print?"',
	'one console.log is debugging, six is venting.',
	'production will look at these logs and ask: is this an app or a diary?'
];

export const TODO_FIXME_ROASTS_EN: readonly string[] = [
	'this TODO is older than the sprint it came from.',
	'FIXME was written, then forgotten with remarkable consistency.',
	'TODO: do it later. Later: never arrives.',
	'the code is asking for help through a comment, and nobody answers.',
	'this FIXME is like a sweet promise: written with intent, left with acceptance.',
	'this TODO is no longer a guest, it is a permanent resident.'
];

export const GENERAL_ROASTS_EN: readonly string[] = [
	'this code works, but in a way that makes reviewers shake their heads.',
	'does it work? yes. Should you be proud? not yet.',
	'if code could talk, this one would be apologizing.'
];

/** Every English roast, in one list. */
export const ROASTS_EN: readonly string[] = [
	...EMPTY_CATCH_ROASTS_EN,
	...CONSOLE_LOG_ROASTS_EN,
	...TODO_FIXME_ROASTS_EN,
	...GENERAL_ROASTS_EN
];

/** Every roast, Indonesian + English, in one list, for random pick or display. */
export const ROASTS: readonly string[] = [
	...EMPTY_CATCH_ROASTS,
	...CONSOLE_LOG_ROASTS,
	...TODO_FIXME_ROASTS,
	...GENERAL_ROASTS,
	...ROASTS_EN
];

/** Pick a random roast from a list, defaulting to the full list. */
export function randomRoast(roasts: readonly string[] = ROASTS): string {
	return roasts[Math.floor(Math.random() * roasts.length)];
}
