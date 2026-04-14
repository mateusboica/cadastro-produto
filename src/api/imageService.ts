const IMGBB_KEY = import.meta.env.VITE_IMGBB_KEY

const imageService = {
  upload: async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
      {
        method: 'POST',
        body: formData,
      },
    )

    const data = (await response.json()) as {
      success?: boolean
      data?: { url?: string }
    }

    return data.success ? (data.data?.url ?? null) : null
  },
}

export default imageService
