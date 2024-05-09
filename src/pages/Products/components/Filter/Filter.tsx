import { useAppDispatch, useAppSelector } from '../../../../hooks'
import {
  booksSelector,
  fetchAllBooks,
  filterBooks,
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterDiscount,
  setBooksFilterPublishYear,
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
import { enforceMinMax, generateFilterArray } from '../../../../utils'
import { Accordion, AccordionItem } from '@szhsin/react-accordion'
import {
  IFilter,
  IInputEvent,
  IDiscountChangeEvent,
} from '../../../../interfaces'
import Star from '../../../../assets/svg/star.svg?react'
import StarFilled from '../../../../assets/svg/star_solid.svg?react'
import Slider from 'rc-slider'
import { sliderStyles } from '../../../../styles/Global.styles'
import 'rc-slider/assets/index.css'

const initialValues: IFilter = {
  genre: [],
  price: [],
  discount: 'allBooks',
  publishYear: [],
  rating: 1,
}

const discountOptions: { value: IFilter['discount']; label: string }[] = [
  { value: 'allBooks', label: 'All Books' },
  { value: 'discountOnly', label: 'With Discount' },
  { value: 'fullPriceOnly', label: 'Full Price Books' },
]

export function Filter() {
  const dispatch = useAppDispatch()
  const { booksFilters } = useAppSelector(booksSelector)

  const [priceMinInitial, priceMaxInitial] = booksFilters.initial.price
  const [priceMin, priceMax] = booksFilters.active.price
  const [yearMinInitial, yearMaxInitial] = booksFilters.initial.publishYear
  const [yearMin, yearMax] = booksFilters.active.publishYear

  const priceMarks = {
    [priceMinInitial]: `$ ${priceMinInitial}`,
    [priceMaxInitial]: `$ ${priceMaxInitial}`,
  }

  const yearMarks = {
    [yearMinInitial]: `${yearMinInitial}`,
    [yearMaxInitial]: `${yearMaxInitial}`,
  }

  const handleSubmit = (values: IFilter) => {
    dispatch(
      filterBooks({
        ...values,
        genre: booksFilters.active.genre,
        price: generateFilterArray(
          priceMin,
          priceMax,
          priceMinInitial,
          priceMaxInitial,
        ) as number[],
        discount: booksFilters.active.discount,
        publishYear: generateFilterArray(
          yearMin,
          yearMax,
          yearMinInitial,
          yearMaxInitial,
        ) as number[],
      }),
    )
  }

  const handleFormReset = () => {
    dispatch(fetchAllBooks())
    dispatch(setBooksFilterGenre([]))
    dispatch(setBooksFilterPrice([]))
    dispatch(setBooksFilterDiscount('allBooks'))
    dispatch(setBooksFilterPublishYear([]))
  }

  const handleGenreFilterChange = (e: IInputEvent) => {
    dispatch(setBooksFilterGenre(e.target.value))
  }

  const handleGenreFilterClear = () => {
    dispatch(setBooksFilterGenre([]))
  }

  const handlePriceFilterChange = (value: IFilter['price']) => {
    dispatch(setBooksFilterPrice(value))
  }

  const handleDiscountFilterChange = (value: IFilter['discount']) => {
    dispatch(setBooksFilterDiscount(value))
  }

  const handlePublishYearFilterChange = (value: IFilter['publishYear']) => {
    dispatch(setBooksFilterPublishYear(value))
  }

  return (
    <StyledFilter>
      <FilterOptions draggable="false">
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => handleSubmit(values)}
          onReset={handleFormReset}>
          {({ values, setFieldValue }) => {
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
                    {discountOptions.map((item) => (
                      <DiscountRadioButtons key={item.value}>
                        <Field
                          type="radio"
                          name="discount"
                          value={item.value}
                          id={item.value}
                          onChange={(e: IDiscountChangeEvent) =>
                            handleDiscountFilterChange(e.target.value)
                          }
                          checked={item.value === booksFilters.active.discount}
                        />
                        <label htmlFor={item.value}>{item.label}</label>
                      </DiscountRadioButtons>
                    ))}
                  </AccordionItem>

                  <AccordionItem header="Publication Year">
                    {booksFilters.initial.publishYear && (
                      <>
                        <Slider
                          range
                          min={yearMinInitial}
                          max={yearMaxInitial}
                          value={booksFilters.active.publishYear}
                          defaultValue={booksFilters.initial.publishYear}
                          step={25}
                          marks={yearMarks}
                          styles={sliderStyles}
                          onChange={(value) =>
                            handlePublishYearFilterChange(value as number[])
                          }
                          allowCross={false}
                        />
                        <InputFields>
                          <Field
                            type="number"
                            inputMode="numeric"
                            value={yearMin}
                            onChange={(e: IInputEvent) =>
                              handlePublishYearFilterChange([
                                Number(e.target.value),
                                yearMax,
                              ])
                            }
                            onBlur={(e: IInputEvent) =>
                              handlePublishYearFilterChange([
                                Math.min(enforceMinMax(e.target), yearMax),
                                yearMax,
                              ])
                            }
                            min={yearMinInitial}
                            max={yearMaxInitial}
                          />
                          -
                          <Field
                            type="number"
                            inputMode="numeric"
                            value={yearMax}
                            onChange={(e: IInputEvent) =>
                              handlePublishYearFilterChange([
                                yearMin,
                                Number(e.target.value),
                              ])
                            }
                            onBlur={(e: IInputEvent) =>
                              handlePublishYearFilterChange([
                                yearMin,
                                Math.max(enforceMinMax(e.target), yearMin),
                              ])
                            }
                            min={yearMinInitial}
                            max={yearMaxInitial}
                          />
                        </InputFields>
                      </>
                    )}
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
