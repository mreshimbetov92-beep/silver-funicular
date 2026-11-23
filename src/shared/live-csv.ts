/** Quote CSV fields and keep user-entered text from becoming spreadsheet formulas. */
export function csvCell(v:unknown){let s=String(v??'');if(/^[\s]*[=+\-@]|^[\t\r\n]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}
