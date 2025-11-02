module.exports = (sequelize, DataTypes) => {
    
    const EmotionalCheckin = sequelize.define('EmotionalCheckin', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        emoji: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATEONLY, // Guarda solo la fecha (YYYY-MM-DD)
            allowNull: false
        }
        // 'userId' se añade automáticamente por la relación
    }, {
        timestamps: true,
        // Índice único para evitar múltiples check-ins por día por usuario
        uniqueKeys: {
            daily_checkin: {
                fields: ['userId', 'date']
            }
        }
    });

    return EmotionalCheckin;
};