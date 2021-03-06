const { Model, DataTypes, QueryTypes } = require('sequelize');

class Feedback extends Model {
	static init(sequelize) {
		super.init(
			{
				fbk_datacriacao: DataTypes.DATE,
				fbk_status: DataTypes.BOOLEAN,
				fbk_valor: DataTypes.INTEGER,
				tag_valor_boolean: DataTypes.BOOLEAN,
			},
			{ sequelize }
		);
	}

	static associate(models) {
		this.belongsTo(models.User, { foreignKey: 'usu_id' });
		this.belongsTo(models.PodCast, { foreignKey: 'pod_id' });
		this.belongsTo(models.TipoFeedback, { foreignKey: 'tfb_id' });
	}

	//Cadastra os tipos de Feedback - Favoritar/Marcar como Pretendo Acompanhar/Acompanhando/Nota
	static async createFeedback(data) {
		try {
			const [result] = await this.sequelize.query(
				'INSERT INTO fbk_feedback (fbk_datacriacao, fbk_status, fbk_valor, fbk_valor_status, usu_id, pod_id, tfb_id) values (?)',
				{
					replacements: [data],
					type: QueryTypes.INSERT,
					nest: true,
				}
			);
			return result;
		} catch (err) {
			console.log(err);
			return false;
		}
	}

	//Muda status do Favorito (Favorita e Desfavorita)
	static async updateFavorito(podid, fbkstatus, usuid) {
		try {
			const [result] = await this.sequelize.query(
				'update fbk_feedback set fbk_status = :fbk_status where pod_id = :pod_id and tfb_id = 1 and usu_id = :usu_id',
				{
					replacements: { pod_id: podid, fbk_status: fbkstatus, usu_id: usuid },
					type: QueryTypes.UPDATE,
					nest: true,
				}
			);
			return true;
		} catch (err) {
			console.log(err);
			return false;
		}
	}

	//Muda status do Podcast Marcado (Desmarca, Marca pra Pretendo Acompanhar ou Acompanhando)
	static async updateAcompanhando(podid, fbkstatus, usuid) {
		try {
			const [result] = await this.sequelize.query(
				'update fbk_feedback set fbk_status = :fbk_status where pod_id = :pod_id and tfb_id = 2 and usu_id = :usu_id',
				{
					replacements: { pod_id: podid, fbk_status: fbkstatus, usu_id: usuid },
					type: QueryTypes.UPDATE,
					nest: true,
				}
			);
			return true;
		} catch (err) {
			console.log(err);
			return false;
		}
	}

	//Muda nota do podcast avaliado
	static async updateAvaliar(podid, fbkvalor, fbkstatus, usuid) {
		try {
			const [result] = await this.sequelize.query(
				'update fbk_feedback set fbk_valor = :fbk_valor, fbk_status = :fbk_status where pod_id = :pod_id and tfb_id = 3 and usu_id = :usu_id',
				{
					replacements: {
						pod_id: podid,
						fbk_status: fbkstatus,
						fbk_valor: fbkvalor,
						usu_id: usuid,
					},
					type: QueryTypes.UPDATE,
					nest: true,
				}
			);
			return true;
		} catch (err) {
			console.log(err);
			return false;
		}
	}

	//Visualiza todos os feedbacks feitos
	static async findAllFeedback() {
		const results = await this.sequelize.query(
			' select a.usu_nome, b.pod_nome, b.pod_id, c.tfb_descricao, d.fbk_status from usu_usuario a join fbk_feedback d on a.usu_id  = d.usu_id join pod_podcast b on b.pod_id = d.pod_id join tfb_tipo_feedback c on c.tfb_id = d.tfb_id  and b.pod_status = 1'
		);

		return results;
	}

	//Visualiza Média (nota) de um Podcast
	static async findNotaMedia(podid) {
		const [results] = await this.sequelize.query(
			'select avg (d.fbk_valor) as pod_media from fbk_feedback d join pod_podcast b on b.pod_id = d.pod_id join tfb_tipo_feedback c on c.tfb_id = d.tfb_id where b.pod_id = :pod_id and c.tfb_id = 3 and d.fbk_status = 1 and b.pod_status = 1',
			{
				replacements: { pod_id: podid},
				type: QueryTypes.SELECT,
				nest: true,
			}
		);

		return results;
	}

	//Visualiza Favoritos feitos para um podcast por um usuario
	static async findFavorito(podid, usuid) {
		const [results] = await this.sequelize.query(
			'select a.usu_nome, b.pod_id, b.pod_nome, c.tfb_descricao, d.fbk_id, d.fbk_status from usu_usuario a join fbk_feedback d on a.usu_id  = d.usu_id join pod_podcast b on b.pod_id = d.pod_id join tfb_tipo_feedback c on c.tfb_id = d.tfb_id where b.pod_id = :pod_id and a.usu_id = :usu_id and c.tfb_id = 1 and d.fbk_status = 1 and b.pod_status = 1;',
			{
				replacements: { pod_id: podid, usu_id: usuid },
				type: QueryTypes.SELECT,
				nest: true,
			}
		);

		return results;
	}

	//Visualiza avaliação feitoa para um podcast por um usuario
	static async findAvaliar(podid, usuid) {
		const [results] = await this.sequelize.query(
			'select a.usu_nome, b.pod_id, b.pod_nome, c.tfb_descricao, d.fbk_valor, d.fbk_id, d.fbk_status from usu_usuario a join fbk_feedback d on a.usu_id  = d.usu_id join pod_podcast b on b.pod_id = d.pod_id join tfb_tipo_feedback c on c.tfb_id = d.tfb_id where b.pod_id = :pod_id  and a.usu_id = :usu_id and c.tfb_id = 3 and d.fbk_status = 1 and b.pod_status = 1',

			{
				replacements: { pod_id: podid, usu_id: usuid },
				type: QueryTypes.SELECT,
				nest: true,
			}
		);

		return results;
	}

	//Visualiza todos os Acompanhando/PretendoAcompanhar feitos para um podcast
	static async findAcompanhando(podid, usuid) {
		const [results] = await this.sequelize.query(
			'select a.usu_nome, b.pod_nome, c.tfb_descricao, d.fbk_id, d.fbk_status from usu_usuario a join fbk_feedback d on a.usu_id  = d.usu_id join pod_podcast b on b.pod_id = d.pod_id join tfb_tipo_feedback c on c.tfb_id = d.tfb_id where b.pod_id = :pod_id and a.usu_id = :usu_id and d.tfb_id = 2  and b.pod_status = 1',
			{
				replacements: { pod_id: podid, usu_id: usuid },
				type: QueryTypes.SELECT,
				nest: true,
			}
		);

		return results;
	}

	//Visualiza todos os Feedbacks de um usuário
	static async findFeedbackUser(usuid) {
		const results = await this.sequelize.query(
			'  select a.usu_nome, b.pod_id as podid, (select d.fbk_valor from usu_usuario a join fbk_feedback d on a.usu_id  = d.usu_id join pod_podcast b on b.pod_id = d.pod_id join tfb_tipo_feedback c on c.tfb_id = d.tfb_id where a.usu_id = 2 and d.tfb_id = 3  and b.pod_status = 1 and b.pod_id = podid and d.fbk_status = 1 order by d.fbk_id DESC LIMIT 1) as nota, b.pod_nome, c.tfb_id, c.tfb_descricao, d.fbk_valor, d.fbk_status from usu_usuario a join fbk_feedback d on a.usu_id  = d.usu_id join pod_podcast b on b.pod_id = d.pod_id join tfb_tipo_feedback c on c.tfb_id = d.tfb_id where a.usu_id = ?  and b.pod_status = 1',
			{
				replacements: [usuid],
				type: QueryTypes.SELECT,
				nest: true,
			}
		);

		return results;
	}

	//TODOS DE UM PODCAST - acompanhando
	static async findCountAcompanhando(podid) {
		const [results] = await this.sequelize.query(
			'select count(d.fbk_id) as qtd_acompanhando from usu_usuario a join fbk_feedback d on a.usu_id  = d.usu_id join pod_podcast b on b.pod_id = d.pod_id join tfb_tipo_feedback c on c.tfb_id = d.tfb_id where b.pod_id = :pod_id and d.tfb_id = 2  and b.pod_status = 1 and fbk_status = 1',
			{
				replacements: { pod_id: podid },
				type: QueryTypes.SELECT,
				nest: true,
			}
		);

		return results;
	}

	//TODOS DE UM PODCAST - pretendo acompanhar
	static async findCountAcompanhar(podid) {
		const [results] = await this.sequelize.query(
			'select count(d.fbk_id) as qtd_acompanhar from usu_usuario a join fbk_feedback d on a.usu_id  = d.usu_id join pod_podcast b on b.pod_id = d.pod_id join tfb_tipo_feedback c on c.tfb_id = d.tfb_id where b.pod_id = :pod_id and d.tfb_id = 2  and b.pod_status = 1 and fbk_status = 2',
			{
				replacements: { pod_id: podid },
				type: QueryTypes.SELECT,
				nest: true,
			}
		);

		return results;
	}

	//TODOS DE UM PODCAST - FAVORITOS
	static async findCountFav(podid) {
		const [results] = await this.sequelize.query(
			'select count(d.fbk_id) as qtd_fav from usu_usuario a join fbk_feedback d on a.usu_id  = d.usu_id join pod_podcast b on b.pod_id = d.pod_id join tfb_tipo_feedback c on c.tfb_id = d.tfb_id where b.pod_id = :pod_id and d.tfb_id = 1  and b.pod_status = 1 and fbk_status = 1',
			{
				replacements: { pod_id: podid },
				type: QueryTypes.SELECT,
				nest: true,
			}
		);

		return results;
	}
}

module.exports = Feedback;
