if (!globalThis.Cypress) {
    queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent('loadded-editorjs-script'))
    })
}
window.addEventListener('loadded-editorjs-script', () => {
    const version = window.editorVersion
    const MultiBlockSelectionPlugin = self.MultiBlockSelectionPlugin

    let selectedBlocks = []
    window.addEventListener(MultiBlockSelectionPlugin.SELECTION_CHANGE_EVENT, (ev) => {
        selectedBlocks = ev.detail.selectedBlocks.slice()
    })

    class ExtendedUnderline extends Underline {
        elementTagName = 'u'

        surround(range) {
            console.log('surround selectedBlocks', selectedBlocks)
            if (!selectedBlocks.length) {
                console.log('super.surround', range)
                super.surround(range)
                return
            }
            console.log('surround', range)
            let isAppliedOnAllSelectedBlocks = true
            // verify if it is applied to all selected blocks
            selectedBlocks.forEach(({ blockId, index }) => {
                const el = document.querySelector(`.codex-editor__redactor .ce-block:nth-child(${index + 1})`)
                if (!(el instanceof HTMLElement)) return

                const textEl = el.querySelector('[contenteditable=true]')
                if (!(textEl instanceof HTMLElement)) return
                const allText = el.textContent

                const firstBoldEl = textEl.querySelector(this.elementTagName)
                const isAppliedOnCurrentBlock = firstBoldEl && firstBoldEl.textContent == allText

                if (isAppliedOnCurrentBlock) return
                isAppliedOnAllSelectedBlocks = false
            })

            selectedBlocks.forEach(({ blockId, index }) => {
                // depending on your editor version you might have to use getByIndex();
                const block = this.api.blocks.getById(blockId)
                if (!block) return

                const el = block.holder
                if (!(el instanceof HTMLElement)) return

                const textEl = el.querySelector('[contenteditable=true]')
                if (!(textEl instanceof HTMLElement)) return
                const allText = el.textContent

                const firstUnderlineEl = textEl.querySelector(this.elementTagName)
                const isAppliedOnCurrentBlock = firstUnderlineEl && firstUnderlineEl.textContent == allText
                const shouldRemove = isAppliedOnAllSelectedBlocks
                const shouldAdd = !isAppliedOnAllSelectedBlocks && !isAppliedOnCurrentBlock

                if (shouldRemove) {
                    textEl.querySelectorAll(this.elementTagName).forEach((b) => b.replaceWith(...b.childNodes))
                    block.dispatchChange()
                    return
                }

                if (!shouldAdd) return

                textEl.querySelectorAll(this.elementTagName).forEach((b) => b.replaceWith(...b.childNodes))

                const newUnderline = document.createElement(this.elementTagName)
                newUnderline.append(...textEl.childNodes)

                textEl.replaceChildren(newUnderline)
                block.dispatchChange()
            })
        }
    }
    const dataLocation = 'editorjs-data-testing'

    let data = {}
    try {
        data = JSON.parse(localStorage.getItem(dataLocation))
        // console.log('🚀 ~ data:', data)
    } catch {}
    var editor = new EditorJS({
        holder: 'editor',
        tools: {
            underline: {
                class: ExtendedUnderline,
            },
            list: {
                class: self.List,
            },
            header: {
                class: self.Header,
            },
        },
        data,
    })

    var editor2 = new EditorJS({
        holder: 'editor2',
        tools: {
            underline: {
                class: ExtendedUnderline,
            },
        },
    })

    // console.log('🚀 ~ editor:', editor.configuration?.tools)
    const blockSelection = new MultiBlockSelectionPlugin({
        editor,
        version: EditorJS.version,
        onBeforeToolbarOpen(toolbar) {
            if (!(toolbar instanceof HTMLElement)) return
            const dropdown = toolbar.querySelector('.ce-inline-toolbar__dropdown')
            /*
            if (dropdown instanceof HTMLElement) {
                dropdown.style.display = 'none'
            }
            toolbar.querySelectorAll('[data-tool]:not([data-tool=underline])').forEach((el) => {
                if (!(el instanceof HTMLElement)) return
                el.style.display = 'none'
            })
                */
            toolbar.classList.add('toolbarIsOpen')
        },
        onAfterToolbarClose(toolbar) {
            if (!(toolbar instanceof HTMLElement)) return
            const dropdown = toolbar.querySelector('.ce-inline-toolbar__dropdown')
            if (dropdown instanceof HTMLElement) {
                dropdown.style.display = ''
            }
            toolbar.querySelectorAll('[data-tool]:not([data-tool=underline])').forEach((el) => {
                if (!(el instanceof HTMLElement)) return
                el.style.display = ''
            })
            setTimeout(() => {
                toolbar.classList.remove('toolbarIsOpen')
            }, 250)
        },
    })
    const blockSelection2 = new MultiBlockSelectionPlugin({
        editor: editor2,
        version: EditorJS.version,
        onBeforeToolbarOpen(toolbar) {
            if (!(toolbar instanceof HTMLElement)) return
            const dropdown = toolbar.querySelector('.ce-inline-toolbar__dropdown')
            /*
            if (dropdown instanceof HTMLElement) {
                dropdown.style.display = 'none'
            }
            toolbar.querySelectorAll('[data-tool]:not([data-tool=underline])').forEach((el) => {
                if (!(el instanceof HTMLElement)) return
                el.style.display = 'none'
            })
                */
            toolbar.classList.add('toolbarIsOpen')
        },
        onAfterToolbarClose(toolbar) {
            if (!(toolbar instanceof HTMLElement)) return
            const dropdown = toolbar.querySelector('.ce-inline-toolbar__dropdown')
            if (dropdown instanceof HTMLElement) {
                dropdown.style.display = ''
            }
            toolbar.querySelectorAll('[data-tool]:not([data-tool=underline])').forEach((el) => {
                if (!(el instanceof HTMLElement)) return
                el.style.display = ''
            })
            setTimeout(() => {
                toolbar.classList.remove('toolbarIsOpen')
            }, 250)
        },
    })

    window.isEditorReady = editor.isReady.then(() => {
        // console.log('🚀 ~ editor.isReady.then ~ editor:', editor)
        blockSelection.listen()
        blockSelection2.listen()
    })
})
