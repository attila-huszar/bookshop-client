import { Formik, Form, Field } from 'formik'
import Slider from 'rc-slider'
import {
  StyledFilter,
  FilterOptions,
  InputFields,
  GenreCheckBoxes,
  DiscountRadioButtons,
  Rating,
  ButtonWrapper,
  CustomButton,
} from './Filter.style'
import { useAppDispatch, useAppSelector } from '@/hooks'
import {
  booksSelector,
  fetchBooks,
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterDiscount,
  setBooksFilterPublishYear,
  setBooksFilterRating,
  setBooksCurrentPage,
} from '@/store'
import { Accordion, AccordionItem, IconButton } from '@/components'
import { enforceMinMax, generateFilterArray } from '@/helpers'
import { filterInitialValues, discountOptions } from '@/constants'
import { sliderStyles } from '@/styles/Global.style'
import 'rc-slider/assets/index.css'
import Star from '@/assets/svg/star.svg?react'
import StarFilled from '@/assets/svg/star_solid.svg?react'
import { IFilter, IInputEvent, IDiscountChangeEvent } from '@/interfaces'

export function Filter() {
  const { booksFilters } = useAppSelector(booksSelector)
  const dispatch = useAppDispatch()

  const [priceMinInitialFloat = 0, priceMaxInitialFloat = 500] =
    booksFilters.initial.price
  const priceMinInitial = Math.floor(priceMinInitialFloat)
  const priceMaxInitial = Math.ceil(priceMaxInitialFloat)

  const [priceMinFloat = 0, priceMaxFloat = 500] = booksFilters.active.price
  const priceMin = Math.floor(priceMinFloat)
  const priceMax = Math.ceil(priceMaxFloat)

  const [yearMinInitial = 1000, yearMaxInitial = new Date().getFullYear()] =
    booksFilters.initial.publishYear
  const [yearMin = 1000, yearMax = new Date().getFullYear()] =
    booksFilters.active.publishYear

  const priceMarks = {
    [priceMinInitial]: `$ ${priceMinInitial}`,
    [priceMaxInitial]: `$ ${priceMaxInitial}`,
  }

  const yearMarks = {
    [yearMinInitial]: `${yearMinInitial}`,
    [yearMaxInitial]: `${yearMaxInitial}`,
  }

  const handleFormSubmit = () => {
    dispatch(setBooksCurrentPage(1))
    void dispatch(
      fetchBooks({
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
        rating: booksFilters.active.rating,
      }),
    )
  }

  const handleFormReset = () => {
    void dispatch(fetchBooks())
    dispatch(setBooksCurrentPage(1))
    dispatch(setBooksFilterGenre([]))
    dispatch(setBooksFilterPrice([]))
    dispatch(setBooksFilterDiscount('allBooks'))
    dispatch(setBooksFilterPublishYear([]))
    dispatch(setBooksFilterRating(0.5))
  }

  const handleGenreChange = (e: IInputEvent) => {
    dispatch(setBooksFilterGenre(e.target.value))
  }

  const handleGenreClear = () => {
    dispatch(setBooksFilterGenre([]))
  }

  const handlePriceChange = (value: IFilter['price']) => {
    dispatch(setBooksFilterPrice(value))
  }

  const handleDiscountChange = (value: IFilter['discount']) => {
    dispatch(setBooksFilterDiscount(value))
  }

  const handlePublishYearChange = (value: IFilter['publishYear']) => {
    dispatch(setBooksFilterPublishYear(value))
  }

  const handleRatingChange = (value: IFilter['rating']) => {
    dispatch(setBooksFilterRating(value))
  }

  return (
    <StyledFilter>
      <FilterOptions draggable="false">
        <Formik
          initialValues={filterInitialValues}
          onSubmit={handleFormSubmit}
          onReset={handleFormReset}>
          <Form>
            <Accordion defaultOpenPanels={[0, 1]}>
              <AccordionItem header="Genre">
                <GenreCheckBoxes>
                  {booksFilters.initial.genre?.map((filter) => (
                    <div key={filter}>
                      <Field
                        name="genre"
                        type="checkbox"
                        value={filter}
                        id={filter}
                        onChange={(e: IInputEvent) => handleGenreChange(e)}
                        checked={booksFilters.active.genre.includes(filter)}
                      />
                      <label htmlFor={filter}>{filter}</label>
                    </div>
                  ))}
                </GenreCheckBoxes>
                <button type="button" onClick={handleGenreClear}>
                  Clear selection
                </button>
              </AccordionItem>

              <AccordionItem header="Price">
                {booksFilters.active.price && (
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
                      onChange={(value) => handlePriceChange(value as number[])}
                      allowCross={false}
                    />
                    <InputFields>
                      <Field
                        type="number"
                        inputMode="numeric"
                        value={priceMin}
                        onChange={(e: IInputEvent) =>
                          handlePriceChange([Number(e.target.value), priceMax])
                        }
                        onBlur={(e: IInputEvent) =>
                          handlePriceChange([
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
                          handlePriceChange([priceMin, Number(e.target.value)])
                        }
                        onBlur={(e: IInputEvent) =>
                          handlePriceChange([
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
                        handleDiscountChange(e.target.value)
                      }
                      checked={item.value === booksFilters.active.discount}
                    />
                    <label htmlFor={item.value}>{item.label}</label>
                  </DiscountRadioButtons>
                ))}
              </AccordionItem>

              <AccordionItem header="Publication Year">
                {booksFilters.active.publishYear && (
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
                        handlePublishYearChange(value as number[])
                      }
                      allowCross={false}
                    />
                    <InputFields>
                      <Field
                        type="number"
                        inputMode="numeric"
                        value={yearMin}
                        onChange={(e: IInputEvent) =>
                          handlePublishYearChange([
                            Number(e.target.value),
                            yearMax,
                          ])
                        }
                        onBlur={(e: IInputEvent) =>
                          handlePublishYearChange([
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
                          handlePublishYearChange([
                            yearMin,
                            Number(e.target.value),
                          ])
                        }
                        onBlur={(e: IInputEvent) =>
                          handlePublishYearChange([
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
                    const isFilled = idx < booksFilters.active.rating
                    const rating = (idx + 0.5) as IFilter['rating']

                    return (
                      <IconButton
                        key={`rating-${rating + 0.5}`}
                        icon={isFilled ? <StarFilled /> : <Star />}
                        type="button"
                        onClick={() => {
                          handleRatingChange(rating)
                        }}
                        aria-label="rating"
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
        </Formik>
      </FilterOptions>
    </StyledFilter>
  )
}
