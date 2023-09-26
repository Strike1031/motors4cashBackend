module.exports = (sequelize, Sequelize) => {
    const Car = sequelize.define("cars", {
      vehicle_number: {
        type: Sequelize.STRING
      },
      vehicle_name: {
        type: Sequelize.STRING
      },
      created_year: {
        type: Sequelize.INTEGER
      },
      price: {
        type: Sequelize.INTEGER
      },
      bodyStyle: {
        type: Sequelize.STRING
      },
      fuelType: {
        type: Sequelize.STRING
      },
      color: {
        type: Sequelize.STRING
      },
      mileage: {
        type: Sequelize.INTEGER
      },
      previous_owners: {
        type: Sequelize.INTEGER
      },
      service_history: {
        type: Sequelize.INTEGER
      },
      personal_register: {
        type: Sequelize.BOOLEAN
      },
      import_status: {
        type: Sequelize.INTEGER
      },
      v_key: {
        type: Sequelize.BOOLEAN
      },
      non_runner: {
        type: Sequelize.BOOLEAN
      },
      mot_month: {
        type: Sequelize.INTEGER
      },
      insurance: {
        type: Sequelize.INTEGER
      },
      private_hire: {
        type: Sequelize.BOOLEAN
      },
      driving_tuition: {
        type: Sequelize.BOOLEAN
      },
      police: {
        type: Sequelize.BOOLEAN
      },
      seats: {
        type: Sequelize.BOOLEAN
      },
      zone: {
        type: Sequelize.INTEGER
      },
      component: {
        type: Sequelize.INTEGER
      },
      fault: {
        type: Sequelize.INTEGER
      },
    });
  
    return Car;
  };