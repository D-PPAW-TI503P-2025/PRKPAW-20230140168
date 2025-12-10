'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Presensis', 'buktiFoto', {
    type: Sequelize.STRING, // Kita simpan path/nama filenya saja
    allowNull: true
  });
},


  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
