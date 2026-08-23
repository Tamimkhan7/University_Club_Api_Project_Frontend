export function formatBytes(bytes){
    if(bytes === null || bytes === undefined)return "";
    if(bytes <=0)return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let i =0;
    while (size >= 1024 && i <units.length -1){
        size /= 1024;
        i++;
    }

    return `${size.toFixed(1)} ${units[i]}`;
}