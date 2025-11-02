module.exports = (sequelize, DataTypes) => {
    
    const Habit = sequelize.define('Habit', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
        // 'userId' se añade automáticamente por la relación
    }, {
        timestamps: true
    });

    return Habit;
};