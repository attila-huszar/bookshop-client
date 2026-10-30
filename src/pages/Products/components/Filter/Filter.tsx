import { useTranslation } from 'react-i18next'
import 'rc-slider/assets/index.css'
import { Field, Form, Formik } from 'formik'
import Slider from 'rc-slider'
import { useSearchOptionsQuery } from '@/store/api/booksApi'
import {
  applyBooksFilters,
  setBooksFilterDiscount,
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterPublishYear,
  setBooksFilterRating,
} from '@/store/slices/books'
import { Accordion, AccordionItem } from '@/components/Accordion'
import { Alert } from '@/components/Alert'
import { IconButton } from '@/components/Button'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { enforceMinMax } from '@/helpers/enforceMinMax'
import { CacheTime } from '@/constants/cacheTimes'
import { discountOptions, filterInitialValues } from '@/constants/defaultValues'
import type { DiscountChangeEvent, Filters, InputEvent } from '@/types'
import { StarIcon, StarOutlineIcon } from '@/assets/svg'
import { sliderStyles } from '@/styles/slider.styles'
import {
  ButtonWrapper,
  CustomButton,
  DiscountRadioButtons,
  FilterOptions,
  GenreCheckBoxes,
  InputFields,
  Rating,
  StyledFilter,
} from './Filter.style'

type FilterProps = {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function Filter({ isMobileOpen = false, onMobileClose }: FilterProps) {
  const { t } = useTranslation()

  const booksFilters = useAppSelector((state) => state.books.booksFilters)
  const { isLoading: booksFiltersLoading, error: booksFiltersError } =
    useSearchOptionsQuery(undefined, {
      refetchOnMountOrArgChange: CacheTime.OneHour,
    })
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
    dispatch(
      applyBooksFilters({
        ...booksFilters.active,
        price: [priceMin, priceMax],
        publishYear: [yearMin, yearMax],
      }),
    )
    if (isMobileOpen) {
      onMobileClose?.()
    }
  }

  const handleFormReset = () => {
    dispatch(applyBooksFilters())
    dispatch(setBooksFilterGenre([]))
    dispatch(setBooksFilterPrice([]))
    dispatch(setBooksFilterDiscount('allBooks'))
    dispatch(setBooksFilterPublishYear([]))
    dispatch(setBooksFilterRating(0.5))
    if (isMobileOpen) {
      onMobileClose?.()
    }
  }

  const handleGenreChange = (e: InputEvent) => {
    dispatch(setBooksFilterGenre(e.target.value))
  }

  const handleGenreClear = () => {
    dispatch(setBooksFilterGenre([]))
  }

  const handlePriceChange = (value: Filters['price']) => {
    dispatch(setBooksFilterPrice(value))
  }

  const handleDiscountChange = (value: Filters['discount']) => {
    dispatch(setBooksFilterDiscount(value))
  }

  const handlePublishYearChange = (value: Filters['publishYear']) => {
    dispatch(setBooksFilterPublishYear(value))
  }

  const handleRatingChange = (value: Filters['rating']) => {
    dispatch(setBooksFilterRating(value))
  }

  if (booksFiltersLoading) {
    return null
  }

  return (
    <StyledFilter $mobileOpen={isMobileOpen}>
      {booksFiltersError ? (
        <Alert message={t('filters.error')} error={booksFiltersError} />
      ) : (
        <FilterOptions draggable="false">
          <Formik
            initialValues={filterInitialValues}
            onSubmit={handleFormSubmit}
            onReset={handleFormReset}>
            <Form>
              <Accordion defaultOpenPanels={[0, 1]}>
                <AccordionItem header={t('common.fields.genre')}>
                  <GenreCheckBoxes>
                    {booksFilters.initial.genre?.map((filter) => (
                      <div key={filter}>
                        <Field
                          name="genre"
                          type="checkbox"
                          value={filter}
                          id={filter}
                          onChange={handleGenreChange}
                          checked={booksFilters.active.genre.includes(filter)}
                        />
                        <label htmlFor={filter}>{filter}</label>
                      </div>
                    ))}
                  </GenreCheckBoxes>
                  <button type="button" onClick={handleGenreClear}>
                    {t('filters.clear')}
                  </button>
                </AccordionItem>

                <AccordionItem header={t('common.fields.price')}>
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
                        onChange={(value) =>
                          handlePriceChange(value as number[])
                        }
                        allowCross={false}
                      />
                      <InputFields>
                        <Field
                          type="number"
                          inputMode="numeric"
                          value={priceMin}
                          onChange={(e: InputEvent) =>
                            handlePriceChange([
                              Number(e.target.value),
                              priceMax,
                            ])
                          }
                          onBlur={(e: InputEvent) =>
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
                          onChange={(e: InputEvent) =>
                            handlePriceChange([
                              priceMin,
                              Number(e.target.value),
                            ])
                          }
                          onBlur={(e: InputEvent) =>
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

                <AccordionItem header={t('common.fields.discount')}>
                  {discountOptions.map((item) => (
                    <DiscountRadioButtons key={item.value}>
                      <Field
                        type="radio"
                        name="discount"
                        value={item.value}
                        id={item.value}
                        onChange={(e: DiscountChangeEvent) =>
                          handleDiscountChange(e.target.value)
                        }
                        checked={item.value === booksFilters.active.discount}
                      />
                      <label htmlFor={item.value}>{t(item.label)}</label>
                    </DiscountRadioButtons>
                  ))}
                </AccordionItem>

                <AccordionItem header={t('common.fields.publishYear')}>
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
                          onChange={(e: InputEvent) =>
                            handlePublishYearChange([
                              Number(e.target.value),
                              yearMax,
                            ])
                          }
                          onBlur={(e: InputEvent) =>
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
                          onChange={(e: InputEvent) =>
                            handlePublishYearChange([
                              yearMin,
                              Number(e.target.value),
                            ])
                          }
                          onBlur={(e: InputEvent) =>
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

                <AccordionItem header={t('common.fields.rating')}>
                  <Rating>
                    {Array.from({ length: 5 }, (_, idx) => {
                      const isFilled = idx < booksFilters.active.rating
                      const rating = (idx + 0.5) as Filters['rating']

                      return (
                        <IconButton
                          key={`rating-${rating + 0.5}`}
                          icon={isFilled ? <StarIcon /> : <StarOutlineIcon />}
                          type="button"
                          onClick={() => {
                            handleRatingChange(rating)
                          }}
                          aria-label={t('common.fields.rating')}
                        />
                      )
                    })}
                  </Rating>
                </AccordionItem>
              </Accordion>
              <ButtonWrapper>
                <CustomButton type="reset" $color="neutral" $inverted>
                  {t('common.actions.reset')}
                </CustomButton>
                <CustomButton type="submit">
                  {t('common.actions.submit')}
                </CustomButton>
              </ButtonWrapper>
            </Form>
          </Formik>
        </FilterOptions>
      )}
    </StyledFilter>
  )
}
