export function formatDT(date) {
    date = new Date(date);

    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    hours = String(hours).padStart(2, "0");

    const minutes = String(date.getMinutes()).padStart(2, "0");
    const formattedDate = date.toLocaleDateString("en-GB");

    return `${hours}:${minutes}${ampm}   ${formattedDate}`;
}

export function timeDiff(punchin, punchout) {
    const diffMs = new Date(punchout) - new Date(punchin);
    let hours = Math.floor(diffMs / (1000 * 60 * 60));
    let minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours.toString().padStart(2, "0")}:` +
        `${minutes.toString().padStart(2, "0")}`;
}

export function formatDateApi(date) {
    date = new Date(date)
    return date.toISOString().split('T')[0];
}
