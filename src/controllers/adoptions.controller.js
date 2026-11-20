import { adoptionsService, petsService, usersService } from "../services/index.js";

// Valida que el id tenga formato de ObjectId de MongoDB (24 caracteres hex).
// Sin esto, un id inválido hace que Mongoose lance un CastError y la request queda colgada.
const isValidId = (id) => /^[a-f\d]{24}$/i.test(id);

const getAllAdoptions = async (req, res) => {
    try {
        const result = await adoptionsService.getAll();
        res.send({ status: "success", payload: result });
    } catch (error) {
        res.status(500).send({ status: "error", error: error.message });
    }
};

const getAdoption = async (req, res) => {
    try {
        const adoptionId = req.params.aid;
        if (!isValidId(adoptionId)) return res.status(400).send({ status: "error", error: "Invalid adoption id" });

        const adoption = await adoptionsService.getBy({ _id: adoptionId });
        if (!adoption) return res.status(404).send({ status: "error", error: "Adoption not found" });

        res.send({ status: "success", payload: adoption });
    } catch (error) {
        res.status(500).send({ status: "error", error: error.message });
    }
};

const createAdoption = async (req, res) => {
    try {
        const { uid, pid } = req.params;
        if (!isValidId(uid) || !isValidId(pid)) return res.status(400).send({ status: "error", error: "Invalid id" });

        const user = await usersService.getUserById(uid);
        if (!user) return res.status(404).send({ status: "error", error: "user Not found" });

        const pet = await petsService.getBy({ _id: pid });
        if (!pet) return res.status(404).send({ status: "error", error: "Pet not found" });
        if (pet.adopted) return res.status(400).send({ status: "error", error: "Pet is already adopted" });

        user.pets.push(pet._id);
        await usersService.update(user._id, { pets: user.pets });
        await petsService.update(pet._id, { adopted: true, owner: user._id });
        await adoptionsService.create({ owner: user._id, pet: pet._id });

        res.send({ status: "success", message: "Pet adopted" });
    } catch (error) {
        res.status(500).send({ status: "error", error: error.message });
    }
};

export default {
    createAdoption,
    getAllAdoptions,
    getAdoption
};
