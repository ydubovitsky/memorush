import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fetchDataService from "../../../service/fetchDataService";
import { BASE_URL } from "../../const/url-endpoints.const";

// -------------------------------------- AsyncThunk --------------------------------------

export const getAllCardSets = createAsyncThunk('card/getAllCardSets', async (arg, { getState }) => {
  const state = getState();
  const token = state.auth.authEntity.token;

  const payload = {
    method: 'GET',
    url: `${BASE_URL}/api/v1/card-set/all`,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token
    }
  }
  const response = await fetchDataService(payload);
  return response.data;
})

export const createNewCardSet = createAsyncThunk('card/create', async (arg, { getState }) => {
  const state = getState();
  const token = state.auth.authEntity.token;

  const payload = {
    method: 'POST',
    url: `${BASE_URL}/api/v1/card-set/add`,
    data: {
      ...arg,
      flashCardArray: Object.values(arg.flashCardArray)
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token
    }
  }
  const response = await fetchDataService(payload);
  return response.data;
})

export const updateCardSet = createAsyncThunk('card/update', async (arg, { getState }) => {
  const state = getState();
  const token = state.auth.authEntity.token;
  const { cardSetId, cardSetEntity } = arg;

  const payload = {
    method: 'PUT',
    url: `${BASE_URL}/api/v1/card-set/update/${cardSetId}`,
    data: {
      ...cardSetEntity,
      flashCardArray: Object.values(cardSetEntity.flashCardArray)
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token
    }
  }
  const response = await fetchDataService(payload);
  return response.data;
})

export const deleteCardSet = createAsyncThunk('card/delete', async (id, { getState }) => {
  const state = getState();
  const token = state.auth.authEntity.token;

  const payload = {
    method: 'DELETE',
    url: `${BASE_URL}/api/v1/card-set/delete/${id}`,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token
    }
  }
  const response = await fetchDataService(payload);
  return response.data;
})

// -------------------------------------- Slice --------------------------------------

const initialState = {
  cardEntity: [],
  status: null,
  error: null
}

const cardSlice = createSlice({
  name: 'card',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getAllCardSets.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(getAllCardSets.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.cardEntity = action.payload;
      })
      .addCase(getAllCardSets.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      // Add new card set
      .addCase(createNewCardSet.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createNewCardSet.fulfilled, (state, action) => {
        state.status = 'succeeded'
      })
      .addCase(createNewCardSet.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  }
})

export default cardSlice.reducer;

// -------------------------------------- Selectors --------------------------------------

export const cardEntitySelector = state => state.card.cardEntity;
export const cardByIdSelector = (state, id) => state.card.cardEntity.find(card => id == card.id);
//TODO Переделать! Сделать мемоизированным и механизм фильтрации изменить!
export const cardEntityByFavoriteAndLearnedSelector = (state, favorite, learned) => {
  const favoriteCards = state.card.cardEntity.filter(card => {
    return card.favorite === favorite
  });
  const learnedCards = state.card.cardEntity.filter(card => {
    return card.learned === learned
  });
  if ((favorite === true) && (learned === false)) return favoriteCards;
  if ((favorite === false) && (learned === true)) return learnedCards;
  return state.card.cardEntity;
}

//TODO Сделать более универсальным
export const getSortedCardByCardSetSelector = state => {
  const sorted = state.card.cardEntity.reduce((result, card) => {
    result[card.cardSet.id] = {
      ...result[card.cardSet.id],
      [card.id]: card
    }
    return result;
  }, {});

  return sorted;
}
