import { Formik, Form, Field } from 'formik'
import {
  StyledFilter,
  FilterOptions,
  InputFields,
  GenreCheckBoxes,
  DiscountRadioButtons,
  Rating,
  ButtonWrapper,
  CustomButton,
} from './Filter.styles'
import { IconButton } from '../../../../components'
import { enforceMinMax } from '../../../../utils/enforceInputValues'
import {
  ControlledAccordion,
  AccordionItem,
  useAccordionProvider,
} from '@szhsin/react-accordion'
import Star from '../../../../assets/svg/star.svg?react'
import StarSolid from '../../../../assets/svg/star_solid.svg?react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

const initialValues = {
  genre: [],
  price: [0, 50],
  discount: 'all',
  publishYear: [1700, 2020],
  rating: 3,
}

const genreOptions = [
  { value: 'sci-fi', label: 'Sci-fi' },
  { value: 'drama', label: 'Drama' },
  { value: 'horror', label: 'Horror' },
]

const priceOptions = [
  { value: 'all', label: 'All Books' },
  { value: 'discountedOnly', label: 'With Discount' },
  { value: 'fullPriceOnly', label: 'Without Discount' },
]

const priceMin = initialValues.price[0]
const priceMax = initialValues.price[1]
const yearMin = initialValues.publishYear[0]
const yearMax = initialValues.publishYear[1]

const priceMarks = {
  [priceMin]: `$ ${priceMin}`,
  [priceMax]: `$ ${priceMax}`,
}

const yearMarks = {
  [yearMin]: `${yearMin}`,
  [yearMax]: `${yearMax}`,
}

interface InputEvent {
  target: EventTarget & HTMLInputElement
}

export function Filter() {
  const accordionProvider = useAccordionProvider({
    allowMultiple: true,
    transition: true,
    transitionTimeout: 250,
  })

  const handleSubmit = () => {}

  return (
    <StyledFilter>
      <FilterOptions draggable="false">
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, handleChange, setFieldValue, setValues }) => {
            return (
              <Form>
                <ControlledAccordion providerValue={accordionProvider}>
                  <AccordionItem header="Genre" initialEntered>
                    {genreOptions.map((item) => (
                      <GenreCheckBoxes key={item.value}>
                        <Field
                          name="genre"
                          type="checkbox"
                          value={item.value}
                          id={item.value}
                        />
                        <label htmlFor={item.value}>{item.label}</label>
                      </GenreCheckBoxes>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setValues((prev) => ({ ...prev, genre: [] }))
                      }>
                      Clear selection
                    </button>
                  </AccordionItem>

                  <AccordionItem header="Price" initialEntered>
                    <Slider
                      range
                      min={priceMin}
                      max={priceMax}
                      value={values.price}
                      defaultValue={values.price}
                      step={1}
                      marks={priceMarks}
                      styles={{
                        track: {
                          backgroundColor: 'var(--secondary-color',
                        },
                        handle: {
                          opacity: 1,
                          border: 'none',
                          backgroundColor: 'var(--secondary-color)',
                        },
                        rail: { backgroundColor: 'var(--grey)' },
                      }}
                      onChange={(value) => setFieldValue('price', value)}
                      allowCross={false}
                    />
                    <InputFields>
                      <Field
                        type="number"
                        inputMode="numeric"
                        value={values.price[0]}
                        onChange={(e: InputEvent) =>
                          setFieldValue('price', [
                            e.target.value,
                            values.price[1],
                          ])
                        }
                        onBlur={(e: InputEvent) =>
                          setFieldValue('price', [
                            Math.min(enforceMinMax(e.target), values.price[1]),
                            values.price[1],
                          ])
                        }
                        min={priceMin}
                        max={priceMax}
                      />
                      -
                      <Field
                        type="number"
                        inputMode="numeric"
                        value={values.price[1]}
                        onChange={(e: InputEvent) =>
                          setFieldValue('price', [
                            values.price[0],
                            e.target.value,
                          ])
                        }
                        onBlur={(e: InputEvent) =>
                          setFieldValue('price', [
                            values.price[0],
                            Math.max(enforceMinMax(e.target), values.price[0]),
                          ])
                        }
                        min={priceMin}
                        max={priceMax}
                      />
                    </InputFields>
                  </AccordionItem>

                  <AccordionItem header="Discount" initialEntered>
                    {priceOptions.map((item) => (
                      <DiscountRadioButtons key={item.value}>
                        <Field
                          type="radio"
                          name="discount"
                          value={item.value}
                          id={item.value}
                          onChange={handleChange}
                        />
                        <label htmlFor={item.value}>{item.label}</label>
                      </DiscountRadioButtons>
                    ))}
                  </AccordionItem>

                  <AccordionItem header="Publication Year">
                    <Slider
                      range
                      min={yearMin}
                      max={yearMax}
                      value={values.publishYear}
                      defaultValue={values.publishYear}
                      step={10}
                      marks={yearMarks}
                      styles={{
                        track: {
                          backgroundColor: 'var(--secondary-color',
                        },
                        handle: {
                          opacity: 1,
                          border: 'none',
                          backgroundColor: 'var(--secondary-color)',
                        },
                        rail: { backgroundColor: 'var(--grey)' },
                      }}
                      onChange={(value) => setFieldValue('publishYear', value)}
                      allowCross={false}
                    />
                    <InputFields>
                      <Field
                        type="number"
                        inputMode="numeric"
                        value={values.publishYear[0]}
                        onChange={(e: InputEvent) =>
                          setFieldValue('publishYear', [
                            e.target.value,
                            values.publishYear[1],
                          ])
                        }
                        onBlur={(e: InputEvent) =>
                          setFieldValue('publishYear', [
                            Math.min(
                              enforceMinMax(e.target),
                              values.publishYear[1],
                            ),
                            values.publishYear[1],
                          ])
                        }
                        min={yearMin}
                        max={yearMax}
                      />
                      -
                      <Field
                        type="number"
                        inputMode="numeric"
                        value={values.publishYear[1]}
                        onChange={(e: InputEvent) =>
                          setFieldValue('publishYear', [
                            values.publishYear[0],
                            e.target.value,
                          ])
                        }
                        onBlur={(e: InputEvent) =>
                          setFieldValue('publishYear', [
                            values.publishYear[0],
                            Math.max(
                              enforceMinMax(e.target),
                              values.publishYear[0],
                            ),
                          ])
                        }
                        min={yearMin}
                        max={yearMax}
                      />
                    </InputFields>
                  </AccordionItem>

                  <AccordionItem header="Rating">
                    <Rating>
                      {[...Array(values.rating)].map((_, idx) => {
                        const ratingValue = idx + 1
                        return (
                          <IconButton
                            key={`rating-${ratingValue}`}
                            icon={<StarSolid color="var(--secondary-color)" />}
                            type="button"
                            onClick={() => {
                              setFieldValue('rating', ratingValue)
                            }}
                          />
                        )
                      })}
                      {[...Array(5 - values.rating)].map((_, idx) => {
                        const ratingValue = idx + 1
                        return (
                          <IconButton
                            key={`rating-minus-${ratingValue}`}
                            icon={<Star color="var(--grey)" />}
                            type="button"
                            onClick={() => {
                              setFieldValue(
                                'rating',
                                values.rating + ratingValue,
                              )
                            }}
                          />
                        )
                      })}
                    </Rating>
                  </AccordionItem>
                </ControlledAccordion>
                <ButtonWrapper>
                  <CustomButton type="reset" $inverted>
                    Reset
                  </CustomButton>
                  <CustomButton type="submit">Submit</CustomButton>
                </ButtonWrapper>
              </Form>
            )
          }}
        </Formik>
      </FilterOptions>
    </StyledFilter>
  )
}
