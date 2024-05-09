import { useAppDispatch, useAppSelector } from '../../../../hooks'
import {
  booksSelector,
  fetchAllBooks,
  filterBooks,
  setBooksFilterGenre,
  setBooksFilterPrice,
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
import { Accordion, AccordionItem } from '@szhsin/react-accordion'
import { IFilter, IInputEvent } from '../../../../interfaces'
import Star from '../../../../assets/svg/star.svg?react'
import StarFilled from '../../../../assets/svg/star_solid.svg?react'
import Slider from 'rc-slider'
import { sliderStyles } from '../../../../styles/Global.styles'
import 'rc-slider/assets/index.css'

const initialValues = {
  genre: [],
  price: [],
  discount: 'all',
  publishYear: [1700, 2020],
  rating: 1,
}

const priceOptions = [
  { value: 'all', label: 'All Books' },
  { value: 'discountedOnly', label: 'With Discount' },
  { value: 'fullPriceOnly', label: 'Without Discount' },
]

export function Filter() {
  const dispatch = useAppDispatch()
  const { booksFilters } = useAppSelector(booksSelector)

  const [priceMinInitial, priceMaxInitial] = booksFilters.initial.price
  const [priceMin, priceMax] = booksFilters.active.price
  const [yearMin, yearMax] = initialValues.publishYear

  const priceMarks = {
    [priceMinInitial]: `$ ${priceMinInitial}`,
    [priceMaxInitial]: `$ ${priceMaxInitial}`,
  }

  const yearMarks = {
    [yearMin]: `${yearMin}`,
    [yearMax]: `${yearMax}`,
  }

  const priceFilterValues = () => {
    if (priceMin === priceMinInitial && priceMax === priceMaxInitial) {
      return []
    } else if (priceMin === priceMinInitial && priceMax !== priceMaxInitial) {
      return [null, priceMax]
    } else if (priceMin !== priceMinInitial && priceMax === priceMaxInitial) {
      return [priceMin, null]
    } else {
      return [priceMin, priceMax]
    }
  }

  const handleSubmit = (values: IFilter) => {
    dispatch(
      filterBooks({
        ...values,
        genre: booksFilters.active.genre,
        price: priceFilterValues(),
      }),
    )
  }

  const handleFormReset = () => {
    dispatch(fetchAllBooks())
    dispatch(setBooksFilterGenre([]))
    dispatch(setBooksFilterPrice([]))
  }

  const handleGenreFilterChange = (e: IInputEvent) => {
    dispatch(setBooksFilterGenre(e.target.value))
  }

  const handleGenreFilterClear = () => {
    dispatch(setBooksFilterGenre([]))
  }

  const handlePriceFilterChange = (value: number[]) => {
    dispatch(setBooksFilterPrice(value))
  }

  return (
    <StyledFilter>
      <FilterOptions draggable="false">
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => handleSubmit(values)}
          onReset={handleFormReset}>
          {({ values, handleChange, setFieldValue }) => {
            return (
              <Form>
                <Accordion>
                  <AccordionItem header="Genre" initialEntered>
                    {booksFilters.initial.genre && (
                      <GenreCheckBoxes>
                        {booksFilters.initial.genre.map((filter) => (
                          <div key={filter}>
                            <Field
                              name="genre"
                              type="checkbox"
                              value={filter}
                              id={filter}
                              onChange={(e: IInputEvent) =>
                                handleGenreFilterChange(e)
                              }
                              checked={booksFilters.active.genre.includes(
                                filter,
                              )}
                            />
                            <label htmlFor={filter}>{filter}</label>
                          </div>
                        ))}
                      </GenreCheckBoxes>
                    )}
                    <button type="button" onClick={handleGenreFilterClear}>
                      Clear selection
                    </button>
                  </AccordionItem>

                  <AccordionItem header="Price" initialEntered>
                    {booksFilters.initial.price && (
                      <>
                        <Slider
                          range
                          min={priceMinInitial}
                          max={priceMaxInitial}
                          value={booksFilters.active.price}
                          defaultValue={booksFilters.initial.price}
                          step={1}
                          marks={priceMarks}
                          styles={sliderStyles}
                          onChange={(value) =>
                            handlePriceFilterChange(value as number[])
                          }
                          allowCross={false}
                        />
                        <InputFields>
                          <Field
                            type="number"
                            inputMode="numeric"
                            value={priceMin}
                            onChange={(e: IInputEvent) =>
                              handlePriceFilterChange([
                                Number(e.target.value),
                                priceMax,
                              ])
                            }
                            onBlur={(e: IInputEvent) =>
                              handlePriceFilterChange([
                                Math.min(enforceMinMax(e.target), priceMax),
                                priceMax,
                              ])
                            }
                            min={priceMinInitial}
                            max={priceMaxInitial}
                          />
                          -
                          <Field
                            type="number"
                            inputMode="numeric"
                            value={priceMax}
                            onChange={(e: IInputEvent) =>
                              handlePriceFilterChange([
                                priceMin,
                                Number(e.target.value),
                              ])
                            }
                            onBlur={(e: IInputEvent) =>
                              handlePriceFilterChange([
                                priceMin,
                                Math.max(enforceMinMax(e.target), priceMin),
                              ])
                            }
                            min={priceMinInitial}
                            max={priceMaxInitial}
                          />
                        </InputFields>
                      </>
                    )}
                  </AccordionItem>

                  <AccordionItem header="Discount">
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
                      step={25}
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

                  <AccordionItem header="Rating">
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
                </Accordion>
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
