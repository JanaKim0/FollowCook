import { useParams } from "react-router-dom";

import Button from "../components/Button";
import Card from "../components/Card";
import Screen from "../components/Screen";
import { IconCheck } from "../components/icons";
import { paths } from "./paths";

export default function EditRecipeScreen() {
  const { id = "" } = useParams();

  return (
    <Screen
      title="Редактирование"
      backTo={paths.recipe(id)}
      footer={
        <Button variant="primary" size="lg" block icon={<IconCheck />} disabled>
          Сохранить изменения
        </Button>
      }
    >
      <Card>
        <p>Здесь можно будет изменить название, ингредиенты и этапы.</p>
      </Card>
    </Screen>
  );
}
