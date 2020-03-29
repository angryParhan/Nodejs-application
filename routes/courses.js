const {Router} = require('express')
const Course = require('../models/course')
const {validationResult} = require('express-validator')
const auth = require('../middleware/auth')
const {curseValidators} = require('../utils/validators')
const router = Router()

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString()
}

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('userId', 'email name')
      .select('title img price')
    res.render('courses', {
      title: 'Courses',
      isCourses: true,
      userId: req.user ? req.user._id.toString() : null,
      courses
    })
  } catch (e) {
    console.log(e)
  }

})

router.post('/edit', auth, curseValidators,async (req, res) => {
  const errors = validationResult(req)
  const id = req.body.id
  if (!errors.isEmpty()) {
    return res.redirect(`/courses/${id}/edit?allow=true`)
  }
  try {

    delete req.body.id
    const course = await Course.findById(id)

    if (!isOwner(course, req)) {
      return res.redirect('/courses')
    }
    await Course.findOneAndUpdate({ "_id": id }, { "$set": { "title": req.body.title, "price": req.body.price, "img": req.body.img } })
    res.redirect('/courses')
  } catch (e) {
    console.log(e)
  }
})

router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
      userId: req.user._id
    })
    res.redirect('/courses')
  } catch (e) {
    throw e
  }
})

router.get('/:id/edit', async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/')
  }
  try {
    const course = await Course.findById(req.params.id)


    if (!isOwner(course, req)) {
      return res.redirect('/courses')
    }

    res.render('course-edit', {
      title: `Edit ${course.title} course`,
      course
    })
  } catch (e) {
    console.log(e)
  }

})

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    res.render('course', {
      layout: 'empty',
      title: `Course ${course.title}`,
      course
    })
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
