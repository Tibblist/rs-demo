import {
  Grid,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios"; //Custom implementation for a larger/prod site that includes auth headers + others
interface Stage {
  category: string;
  items: Array<string>;
}

interface StageObj {
  companyName: string;
  stages: Array<Stage>;
}

const stagesObj: StageObj = {
  companyName: "My Startup",
  stages: [
    { category: "Stage 1", items: ["Item 1", "Item 2", "Item 3", "Item 4"] },
    { category: "Stage 2", items: ["Item 1", "Item 2", "Item 3"] },
    { category: "Stage 3", items: ["Item 1", "Item 2"] },
    {
      category: "Stage 4",
      items: ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
    },
  ],
}; //Normally would be fetched from the backend or pieced together using data from the backend.

const createDataObjectFromStages = (stageObj: StageObj) => {
  const dataObj: Record<string, Record<string, boolean>> = {};
  stageObj.stages.forEach((stage) => {
    dataObj[stage.category] = { isValid: false };
    stage.items.forEach((item) => {
      dataObj[stage.category][item] = false;
    });
  });
  return dataObj;
};

const validateStageData = (data: Record<string, boolean>) => {
  return Object.keys(data).every((key) => data[key]);
};

const App = () => {
  const [data, setData] = useState(createDataObjectFromStages(stagesObj));
  const [randomFact, setRandomFact] = useState("");

  useEffect(() => {
    localStorage.setItem("data", JSON.stringify(data));
  }, [data]);

  return (
    <Grid container direction="column" alignItems="center">
      <Grid item>
        <Typography variant="h2">{stagesObj.companyName}</Typography>
      </Grid>
      {stagesObj.stages.map((stage, idx) => {
        const isValid = stagesObj.stages
          .slice(0, idx)
          .every((stageCheck) => data[stageCheck.category].isValid); //TODO memoize so you don't have to check over entire array up to idx each time

        return (
          <Grid item>
            <Grid container direction="column" alignItems="flex-start">
              <Grid item>
                <Typography variant="h3">{stage.category}</Typography>
              </Grid>
              <Grid item>
                <FormGroup>
                  {stage.items.map((item) => {
                    const isChecked = data[stage.category][item];
                    return (
                      <FormControlLabel
                        disabled={!isValid}
                        control={
                          <Checkbox
                            checked={isChecked}
                            onChange={async () => {
                              const newDataObj = { ...data };
                              newDataObj[stage.category][item] = !isChecked;
                              const validationObj = { ...newDataObj };
                              delete validationObj[stage.category].isValid; //TODO a bit complicated, instead rework data object to include isValid at a higher level so it doesn't need to be deleted
                              newDataObj[stage.category].isValid =
                                validateStageData(
                                  validationObj[stage.category]
                                );
                              setData(newDataObj);

                              if (
                                idx === stagesObj.stages.length - 1 &&
                                newDataObj[stage.category].isValid
                              ) {
                                const fact = await axios.get(
                                  "https://uselessfacts.jsph.pl/random.json"
                                );
                                setRandomFact(fact.data.text);
                              } else {
                                setRandomFact("");
                              }
                            }}
                          />
                        }
                        label={item}
                      />
                    );
                  })}
                </FormGroup>
              </Grid>
            </Grid>
          </Grid>
        );
      })}
      {randomFact && (
        <Grid item>
          <Typography variant="h4">{randomFact}</Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default App;
