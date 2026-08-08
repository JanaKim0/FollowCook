import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "../components/Card";
import ConfirmDialog from "../components/ConfirmDialog";
import IconButton from "../components/IconButton";
import Screen from "../components/Screen";
import { IconEdit, IconTrash } from "../components/icons";
import { paths } from "./paths";

export default function RecipeScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Screen
      title={`Рецепт №${id}`}
      backTo={paths.home}
      headerRight={
        <>
          <IconButton
            to={paths.editRecipe(id)}
            label="Редактировать"
            icon={<IconEdit />}
          />
          <IconButton
            label="Удалить"
            tone="danger"
            icon={<IconTrash />}
            onClick={() => setConfirmOpen(true)}
          />
        </>
      }
    >
      <Card>
        <p>Здесь будут ингредиенты и этапы приготовления с фотографиями.</p>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        danger
        title="Удалить рецепт?"
        message="Рецепт и все его этапы будут удалены без возможности восстановить."
        confirmLabel="Да, удалить"
        cancelLabel="Отмена"
        onConfirm={() => {
          setConfirmOpen(false);
          navigate(paths.home);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </Screen>
  );
}
