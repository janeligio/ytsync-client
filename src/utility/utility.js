export function displayTimestamp(timestamp) {
    const timeObj = new Date(timestamp);
    let hours = timeObj.getHours();
    let minutes = timeObj.getMinutes();
    let period = 'am';
    if (hours >= 12) {
        hours -= 12;
        period = 'pm';
    } else if (hours === 0) {
        hours = 12;
    }
    if(minutes < 10) {
        minutes = `0${minutes}`
    }
    return `${hours}:${minutes}${period}`
}
export function randomRoomNumber(length) {
    let id = '';
    for (let i = 0; i < length; i++) {
        id += Math.floor(Math.random() * Math.floor(10))
    }
    return id;
}
export function parseURL(URL) {
    // const pattern =/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const pattern =/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
    let matches = URL.match(pattern);
    let videoId = '';
    if(matches && matches.length === 3) {
        videoId = matches.pop();
    }
    return videoId;
}
