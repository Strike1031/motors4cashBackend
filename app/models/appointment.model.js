module.exports = (sequelize, Sequelize) => {
    const Appointment = sequelize.define("appointments", {
      email: {
        type: Sequelize.STRING
      },
      postcode: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.INTEGER
      },
      car_id: {
        type: Sequelize.INTEGER
      },
      appointment_place: {
        type: Sequelize.STRING
      },
      appointment_date: {
        type: Sequelize.STRING   
      },
      appointment_time: {
        type: Sequelize.STRING
      }
    });
  
    return Appointment;
  };
