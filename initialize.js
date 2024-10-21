// This js updates website information to latest information as soon as website loads

const month_display_text = document.getElementById("current-month-display")
const today = new Date();

month_display_text.textContent = today.toLocaleString('default', {month: 'long'}) + " " + today.getFullYear();