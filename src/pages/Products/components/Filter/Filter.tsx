import { useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../hooks'
import {
  booksSelector,
  fetchAllBooks,
  filterBooks,
  setBooksFilters,
} from '../../../../store'
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
import { IFilter, IInputEvent } from '../../../../interfaces'
import Star from '../../../../assets/svg/star.svg?react'
import StarFilled from '../../../../assets/svg/star_solid.svg?react'
import Slider from 'rc-slider'
import { sliderStyles } from '../../../../styles/Global.styles'
import 'rc-slider/assets/index.css'

const initialValues = {
  genre: [],
  price: [0, 50],
  discount: 'all',
  publishYear: [1700, 2020],
  rating: 3,
}

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

export function Filter() {
  const dispatch = useAppDispatch()
  const { booksFilters } = useAppSelector(booksSelector)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const overflowingElem = useRef(null)

  const accordionProvider = useAccordionProvider({
    allowMultiple: true,
    transition: true,
    transitionTimeout: 250,
    onStateChange(e) {
      const currentItem = Number(e.key)

      if (e.current.status === 'preEnter' && currentItem > 0) {
        checkOverflow()
        isOverflowing && toggle(`${currentItem - 1}`)
      }
    },
  })

  const { toggle } = accordionProvider

  function checkOverflow() {
    const element = overflowingElem.current

    if (!element) return

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 1,
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsOverflowing(!entry.isIntersecting)
    }, observerOptions)

    observer.observe(element)
  }

  const handleSubmit = (values: IFilter) => {
    dispatch(filterBooks({ ...values, genre: booksFilters.active.genre }))
  }

  const handleFormReset = () => {
    dispatch(fetchAllBooks())
    dispatch(
      setBooksFilters({
        ...booksFilters,
        active: {},
      }),
    )
  }

  const handleGenreFilterChange = (e: IInputEvent) => {
    dispatch(setBooksFilters(e.target.value))
  }

  const handleGenreFilterClear = () => {
    dispatch(
      setBooksFilters({
        ...booksFilters,
        active: {
          ...booksFilters.active,
          genre: [],
        },
      }),
    )
  }

  return (
    <StyledFilter ref={overflowingElem}>
      <FilterOptions draggable="false">
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => handleSubmit(values)}
          onReset={handleFormReset}>
          {({ values, handleChange, setFieldValue }) => {
            return (
              <Form>
                <ControlledAccordion providerValue={accordionProvider}>
                  <AccordionItem header="Genre" itemKey="0" initialEntered>
                    <GenreCheckBoxes>
                      {booksFilters.available.genre.map((filter) => (
                        <div key={filter}>
                          <Field
                            name="genre"
                            type="checkbox"
                            value={filter}
                            id={filter}
                            onChange={(e: IInputEvent) =>
                              handleGenreFilterChange(e)
                            }
                            checked={booksFilters.active.genre.includes(filter)}
                          />
                          <label htmlFor={filter}>{filter}</label>
                        </div>
                      ))}
                    </GenreCheckBoxes>
                    <button type="button" onClick={handleGenreFilterClear}>
                      Clear selection
                    </button>
                  </AccordionItem>

                  <AccordionItem header="Price" itemKey="1" initialEntered>
                    <Slider
                      range
                      min={priceMin}
                      max={priceMax}
                      value={values.price}
                      defaultValue={values.price}
                      step={1}
                      marks={priceMarks}
                      styles={sliderStyles}
                      onChange={(value) => setFieldValue('price', value)}
                      allowCross={false}
                    />
                    <InputFields>
                      <Field
                        type="number"
                        inputMode="numeric"
                        value={values.price[0]}
                        onChange={(e: IInputEvent) =>
                          setFieldValue('price', [
                            e.target.value,
                            values.price[1],
                          ])
                        }
                        onBlur={(e: IInputEvent) =>
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
                        onChange={(e: IInputEvent) =>
                          setFieldValue('price', [
                            values.price[0],
                            e.target.value,
                          ])
                        }
                        onBlur={(e: IInputEvent) =>
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

                  <AccordionItem header="Discount" itemKey="2" initialEntered>
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

                  <AccordionItem header="Publication Year" itemKey="3">
                    <Slider
                      range
                      min={yearMin}
                      max={yearMax}
                      value={values.publishYear}
                      defaultValue={values.publishYear}
                      step={10}
                      marks={yearMarks}
                      styles={sliderStyles}
                      onChange={(value) => setFieldValue('publishYear', value)}
                      allowCross={false}
                    />
                    <InputFields>
                      <Field
                        type="number"
                        inputMode="numeric"
                        value={values.publishYear[0]}
                        onChange={(e: IInputEvent) =>
                          setFieldValue('publishYear', [
                            e.target.value,
                            values.publishYear[1],
                          ])
                        }
                        onBlur={(e: IInputEvent) =>
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
                        onChange={(e: IInputEvent) =>
                          setFieldValue('publishYear', [
                            values.publishYear[0],
                            e.target.value,
                          ])
                        }
                        onBlur={(e: IInputEvent) =>
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

                  <AccordionItem header="Rating" itemKey="4">
                    <Rating>
                      {Array.from({ length: 5 }, (_, idx) => {
                        const isFilled = idx < values.rating
                        const color = isFilled
                          ? 'var(--secondary-color)'
                          : 'var(--grey)'
                        return (
                          <IconButton
                            key={`rating-${idx + 1}`}
                            icon={
                              isFilled ? (
                                <StarFilled color={color} />
                              ) : (
                                <Star color={color} />
                              )
                            }
                            type="button"
                            onClick={() => setFieldValue('rating', idx + 1)}
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
