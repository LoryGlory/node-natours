const mongoose = require('mongoose');
const slugify = require('slugify');

// mongoose schema for tour model
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    // display virtual properties
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// create virtual property for duration in weeks
tourSchema.virtual('durationWeeks').get(function () {
  // use normal function because of this keyword
  return this.duration / 7; // calculate duration in weeks
});

// run document middleware before .save() and .create() command
tourSchema.pre('save', function (next) {
  // this = current document
  this.slug = slugify(this.name, { lower: true });
  next();
});

// run query middleware before .find(), .findOne etc command
tourSchema.pre(/^find/, function (next) {
  // this = current query
  this.find({ secretTour: { $ne: true } }); // hide secret tours
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(docs);
  console.log(
    `Query took ${Date.now() - this.start} milliseconds`
  );
  next();
});

// Tour model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
