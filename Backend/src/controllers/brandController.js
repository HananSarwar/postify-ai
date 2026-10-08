import Brand from '../models/brandModel.js'

// @route POST /api/brand/save
export const saveBrand = async (req, res) => {
  const { brandName, industry, colors, logoUrl, tone, brandDescription, targetAudience } = req.body

  if (!brandName || !industry) {
    return res.status(400).json({ message: 'brandName and industry are required' })
  }

  try {
    const brand = await Brand.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        brandName,
        industry,
        colors,
        logoUrl,
        tone,
        brandDescription,
        targetAudience,
      },
      { upsert: true, new: true }
    )

    res.status(200).json({ message: 'Brand saved successfully', brand })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// @route GET /api/brand/get
export const getBrand = async (req, res) => {
  try {
    const brand = await Brand.findOne({ userId: req.user._id })
    if (!brand) {
      return res.status(404).json({ message: 'No brand found' })
    }
    res.status(200).json({ brand })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// @route PUT /api/brand/update
export const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findOneAndUpdate(
      { userId: req.user._id },
      { ...req.body },
      { new: true }
    )

    if (!brand) {
      return res.status(404).json({ message: 'No brand found' })
    }

    res.status(200).json({ message: 'Brand updated successfully', brand })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}