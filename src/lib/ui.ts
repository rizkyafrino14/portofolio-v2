// Elemen HTML yang berada "di atas" scene 3D. Klik/ketuk pada elemen ini
// tidak boleh ikut mengenai objek 3D di belakangnya (kucing, telur, lantai, dll.).
const UI_SELECTOR =
  'a,button,input,textarea,select,label,iframe,nav,header,footer,[role="dialog"],[data-ui],.panel,.sticker,h1,h2,h3,p,li'

export function isUiTarget(target: EventTarget | null | undefined): boolean {
  const el = target as HTMLElement | null
  return !!el?.closest?.(UI_SELECTOR)
}
