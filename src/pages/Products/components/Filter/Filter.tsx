import { useState } from 'react'
import {
  StyledFilter,
  FilterOptions,
  InputFields,
  Genre,
  Rating,
} from './Filter.styles'
import { enforceMinMax } from '../../../../utils/enforceInputValues'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import RatingIcon from '../../../../assets/svg/star-stroke-rounded'

const priceMarks = {
  0: '$ 0',
  50: '$ 50',
}

const yearMarks = {
  1700: '1700',
  2020: '2020',
}

const min = 0
const max = 50

export function Filter() {
  const [priceValues, setPriceValues] = useState([0, 50])
  const [discountSelect, setDiscountSelect] = useState('all')
  const [yearValues, setYearValues] = useState([1700, 2020])
  const [genreSelect, setGenreSelect] = useState()
  const [ratingSelect, setRatingSelect] = useState()

  return (
    <StyledFilter>
      <FilterOptions draggable="false">
        <div>
          <p>Price</p>
          <Slider
            range
            min={min}
            max={max}
            value={priceValues}
            defaultValue={priceValues}
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
            onChange={(value) => setPriceValues(value as number[])}
            allowCross={false}
          />
          <InputFields>
            <input
              type="number"
              value={priceValues[0]}
              onChange={(e) =>
                setPriceValues([enforceMinMax(e.target), priceValues[1]])
              }
              min={min}
              max={max}
            />
            -
            <input
              type="number"
              value={priceValues[1]}
              onChange={(e) =>
                setPriceValues([priceValues[0], enforceMinMax(e.target)])
              }
              min={min}
              max={max}
            />
          </InputFields>
        </div>

        <div>
          <p>Discount</p>
          <div>
            <input
              type="radio"
              id="all"
              name="discountSelect"
              value="all"
              checked={discountSelect === 'all'}
              onChange={() => setDiscountSelect('all')}
            />
            <label htmlFor="all">All Books</label>
          </div>
          <div>
            <input
              type="radio"
              id="discountOnly"
              name="discountSelect"
              value="discountOnly"
              checked={discountSelect === 'discountOnly'}
              onChange={() => setDiscountSelect('discountOnly')}
            />
            <label htmlFor="discountOnly">With discount only</label>
          </div>
        </div>

        <div>
          <p>Publication Year</p>
          <Slider
            range
            min={1700}
            max={2020}
            value={yearValues}
            defaultValue={yearValues}
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
            onChange={(value) => setYearValues(value as number[])}
            allowCross={false}
          />
          <InputFields>
            <input
              type="number"
              value={yearValues[0]}
              onChange={(e) =>
                setYearValues([enforceMinMax(e.target), yearValues[1]])
              }
              min={min}
              max={max}
            />
            -
            <input
              type="number"
              value={yearValues[1]}
              onChange={(e) =>
                setYearValues([yearValues[0], enforceMinMax(e.target)])
              }
              min={min}
              max={max}
            />
          </InputFields>
        </div>

        <div>
          <p>Genre</p>
          <Genre>
            <input
              type="checkbox"
              id="sci-fi"
              checked={genreSelect}
              onChange={() => setGenreSelect}
            />
            <label htmlFor="sci-fi">Sci-fi</label>
            <input
              type="checkbox"
              id="drama"
              checked={genreSelect}
              onChange={() => setGenreSelect}
            />
            <label htmlFor="drama">Drama</label>
          </Genre>
        </div>

        <div>
          <p>Rating</p>
          <Rating>
            <RatingIcon />
            <RatingIcon />
            <RatingIcon />
            <RatingIcon />
            <RatingIcon />
          </Rating>
        </div>
      </FilterOptions>
    </StyledFilter>
  )
}
