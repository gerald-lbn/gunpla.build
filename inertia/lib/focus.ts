/**
 * Radix moves focus to the first tabbable element when a dialog opens; for the kit
 * dialog that is a carousel arrow. Send it to the element marked data-autofocus.
 */
export function focusClose(event: Event) {
  const target = (event.currentTarget as HTMLElement | null)?.querySelector<HTMLElement>(
    '[data-autofocus]'
  )
  if (target) {
    event.preventDefault()
    target.focus()
  }
}
