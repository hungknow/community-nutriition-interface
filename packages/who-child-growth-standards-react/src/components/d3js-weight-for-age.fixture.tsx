import { Gender, getWeightForAgeDataset, weightForAgeGirl0To13Weeks } from "who-child-growth-standards";
import { D3JsWeightForAge } from "./d3js-weight-for-age";

// Set date of birth to 10 weeks ago from today
const girlUnder13WeeksDateOfBirth = new Date(Date.now() - 10 * 7 * 24 * 60 * 60 * 1000);
const girlOver13WeeksTo2YearsDateOfBirth = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
const girl2To5YearsDateOfBirth = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000);

const girlUnder13WeeksWeightForAgeDataset = getWeightForAgeDataset({ dateOfBirth: girlUnder13WeeksDateOfBirth, gender: Gender.Female })!;
const girlOver13WeeksTo2YearsWeightForAgeDataset = getWeightForAgeDataset({ dateOfBirth: girlOver13WeeksTo2YearsDateOfBirth, gender: Gender.Female })!;
const girl2To5YearsWeightForAgeDataset = getWeightForAgeDataset({ dateOfBirth: girl2To5YearsDateOfBirth, gender: Gender.Female })!;

export default {
    "girl-under-13-weeks": (
        <D3JsWeightForAge data={girlUnder13WeeksWeightForAgeDataset} dateOfBirth={girlUnder13WeeksDateOfBirth} currentWeight={4} />
    ),
    "girl-0-to-2-years": (
        <D3JsWeightForAge data={girlOver13WeeksTo2YearsWeightForAgeDataset} dateOfBirth={girlOver13WeeksTo2YearsDateOfBirth} currentWeight={4} />
    ),
    "girl-2-to-5-years": (
        <D3JsWeightForAge data={girl2To5YearsWeightForAgeDataset} dateOfBirth={girl2To5YearsDateOfBirth} currentWeight={4} />
    )
}
