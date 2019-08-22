import {getData, sortData} from './data';
import {makeD3} from './makeD3';

export const visualize = (api, ref, firstOpts, secondOpts) => {
    getData(api, ref, firstOpts, secondOpts)
    // .then(links => sortData(links))
    .then(links => makeD3(links))
    .catch(err => console.error(err));
}
