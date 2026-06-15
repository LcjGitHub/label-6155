import { beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})
