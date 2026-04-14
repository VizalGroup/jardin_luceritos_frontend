import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAuthorizedPersonsOrderedByLastName,
  selectFamilyLinksOrderedByLastName,
} from "../../../redux/selectors";

import { GetAuthorizedPersonInfantsLinks, GetAuthorizedPersons, GetFamilyRelationships, GetInfants } from "../../../redux/actions";
import AddAuthorizedPersons from "./AddAuthorizedPersons";
import AuthorizedPersonsTable from "./AuthorizedPersonsTable";
import NavBarDB from "../NavBarDB";
import BackButton from "../../BackButton";

export default function AuthorizedPersons() {
  document.title = "Personas autorizadas - Jardín Rincón de sueños";
  const dispatch = useDispatch();
  const authorized_persons = useSelector(
    selectAuthorizedPersonsOrderedByLastName,
  );
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const familyRelationships = useSelector(selectFamilyLinksOrderedByLastName);
  const authorized_person_infant_links = useSelector(state => state.authorized_person_infant_links);

  // Crear una función que combine las personas autorizadas con los datos de los infantes
  const getAuthorizedPersonsWithInfantData = () => {
    // Agrupar los enlaces por persona autorizada
    const groupedByPerson = authorized_person_infant_links.reduce((acc, link) => {
      const personId = link.id_authorized_person;
      
      if (!acc[personId]) {
        // Encontrar la persona autorizada
        const authorizedPerson = authorized_persons.find(
          person => person.id === personId
        );
        
        if (authorizedPerson) {
          acc[personId] = {
            ...authorizedPerson,
            infants: [], // Array para múltiples infantes
            linkIds: [] // Array para múltiples IDs de relación
          };
        }
      }
      
      // Agregar el infante a la persona autorizada
      if (acc[personId] && link.infant) {
        acc[personId].infants.push({
          ...link.infant,
          id_infant: link.id_infant
        });
        acc[personId].linkIds.push(link.id);
      }
      
      return acc;
    }, {});
    
    // Convertir el objeto agrupado a array
    return Object.values(groupedByPerson).filter(person => person.first_name);
  };

  // Filtrar personas autorizadas según el rol del usuario
  const getFilteredAuthorizedPersons = () => {
    const authorizedPersonsWithInfants = getAuthorizedPersonsWithInfantData();
    
    if (authenticatedUser?.user_role === 3) {
      // Es padre/madre/tutor - mostrar solo autorizados de sus hijos
      const userChildren = familyRelationships
        .filter((link) => link.user_id === authenticatedUser.id)
        .map((link) => link.infant_id);

      return authorizedPersonsWithInfants.filter((person) => 
        person.infants.some(infant => userChildren.includes(infant.id_infant))
      ).map(person => ({
        ...person,
        // Filtrar solo los infantes que pertenecen al padre
        infants: person.infants.filter(infant => userChildren.includes(infant.id_infant))
      }));
    }
    // Para todos los demás roles mostrar todas las personas autorizadas
    return authorizedPersonsWithInfants;
  };

  const filteredAuthorizedPersons = getFilteredAuthorizedPersons();

  useEffect(() => {
    dispatch(GetAuthorizedPersons());
    dispatch(GetFamilyRelationships());
    dispatch(GetInfants());
    dispatch(GetAuthorizedPersonInfantsLinks());
  }, [dispatch]);

  return (
    <div>
      <NavBarDB />
      <div className="watermark-background container" style={{ marginTop: "100px" }}>
        <div className="d-flex gap-3 mb-4">

        <BackButton />
        <AddAuthorizedPersons />
        </div>
        
        <AuthorizedPersonsTable
          authorizedPersons={filteredAuthorizedPersons}
        />
      </div>
    </div>
  );
}
