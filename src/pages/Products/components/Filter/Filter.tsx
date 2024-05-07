import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../hooks'
import {
  booksSelector,
  fetchAllBooks,
  filterBooks,
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterDiscount,
  setBooksFilterPublishYear,
  setBooksFilterRating,
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
import { Accordion, IconButton } from '../../../../components'
import { enforceMinMax, generateFilterArray } from '../../../../utils'
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
  rating: 0.5,
}

const discountOptions: { value: IFilter['discount']; label: string }[] = [
  { value: 'allBooks', label: 'All Books' },
  { value: 'discountOnly', label: 'With Discount' },
  { value: 'fullPriceOnly', label: 'Full Price Books' },
]

export function Filter() {
  const dispatch = useAppDispatch()
  const { booksFilters } = useAppSelector(booksSelector)
  const [panelsOpen, setPanelsOpen] = useState([0, 1])

  function togglePanel(panelKey: number) {
    setPanelsOpen((prevState) => {
      const newPanelsOpen = [...prevState]

      if (newPanelsOpen.includes(panelKey)) {
        newPanelsOpen.splice(newPanelsOpen.indexOf(panelKey), 1)
      } else {
        if (newPanelsOpen.length > 2) {
          newPanelsOpen.shift()
        }
        newPanelsOpen.push(panelKey)
      }

      return newPanelsOpen
    })
  }

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

  const handleFormSubmit = () => {
    dispatch(
      filterBooks({
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
    dispatch(fetchAllBooks())
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
          initialValues={initialValues}
          onSubmit={handleFormSubmit}
          onReset={handleFormReset}>
          <Form>
            <Accordion
              header="Genre"
              panelKey={0}
              isOpen={panelsOpen.includes(0)}
              setIsOpen={(panelKey) => togglePanel(panelKey)}>
              {booksFilters.initial.genre && (
                <GenreCheckBoxes>
                  {booksFilters.initial.genre.map((filter) => (
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
              )}
              <button type="button" onClick={handleGenreClear}>
                Clear selection
              </button>
            </Accordion>

            <Accordion
              header="Price"
              panelKey={1}
              isOpen={panelsOpen.includes(1)}
              setIsOpen={(panelKey) => togglePanel(panelKey)}>
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
            </Accordion>

            <Accordion
              header="Discount"
              panelKey={2}
              isOpen={panelsOpen.includes(2)}
              setIsOpen={(panelKey) => togglePanel(panelKey)}>
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
            </Accordion>

            <Accordion
              header="Publication Year"
              panelKey={3}
              isOpen={panelsOpen.includes(3)}
              setIsOpen={(panelKey) => togglePanel(panelKey)}>
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
            </Accordion>

            <Accordion
              header="Rating"
              panelKey={4}
              isOpen={panelsOpen.includes(4)}
              setIsOpen={(panelKey) => togglePanel(panelKey)}>
              <Rating>
                {Array.from({ length: 5 }, (_, idx) => {
                  const isFilled = idx < booksFilters.active.rating
                  const rating = (idx + 0.5) as IFilter['rating']
                  const color = isFilled
                    ? 'var(--secondary-color)'
                    : 'var(--grey)'
                  return (
                    <IconButton
                      key={`rating-${rating + 0.5}`}
                      icon={
                        isFilled ? (
                          <StarFilled color={color} />
                        ) : (
                          <Star color={color} />
                        )
                      }
                      type="button"
                      onClick={() => {
                        handleRatingChange(rating)
                      }}
                    />
                  )
                })}
              </Rating>
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
